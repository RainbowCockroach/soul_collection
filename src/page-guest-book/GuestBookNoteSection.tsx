import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { Message } from "./types";
import GuestBookNote from "./GuestBookNote";
import EditMessageLightbox from "./EditMessageLightbox";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ArrowButton from "../common-components/ArrowButton";
import { apiBaseUrl } from "../helpers/constants";
import "./GuestBookNoteSection.css";
import LoadingSpinner from "../common-components/LoadingSpinner";

interface PaginatedResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface GuestBookNoteSectionProps {
  notesPerPage?: number;
}

export interface GuestBookNoteSectionRef {
  refresh: () => void;
}

const GuestBookNoteSection = forwardRef<
  GuestBookNoteSectionRef,
  GuestBookNoteSectionProps
>(({ notesPerPage = 4 }, ref) => {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginating, setIsPaginating] = useState(false);
  const hasInitiallyLoaded = useRef(false);
  // Single in-flight controller so fetches can't race and overwrite each other.
  const abortControllerRef = useRef<AbortController | null>(null);

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Fetch notes for the current page; aborts any prior in-flight request.
  // The first load shows the full-section spinner; later page changes dim the
  // existing notes in place via isPaginating instead of unmounting them.
  const fetchNotes = useCallback(
    async (page: number, isInitialLoad: boolean = false) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const { signal } = controller;

      try {
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setIsPaginating(true);
        }

        const response = await fetch(
          `${apiBaseUrl}/messages?type=note&page=${page}&limit=${notesPerPage}`,
          { signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }

        const responseData = await response.json();
        setData(responseData);
        setError(null);

        if (isInitialLoad) {
          hasInitiallyLoaded.current = true;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "An error occurred");
        setData(null);
      } finally {
        if (!signal.aborted) {
          if (isInitialLoad) {
            setLoading(false);
          } else {
            setIsPaginating(false);
          }
        }
      }
    },
    [notesPerPage]
  );

  // Expose refresh function to parent component
  useImperativeHandle(
    ref,
    () => ({
      refresh: () => fetchNotes(currentPage, false),
    }),
    [fetchNotes, currentPage]
  );

  useEffect(() => {
    const isInitialLoad = !hasInitiallyLoaded.current;
    fetchNotes(currentPage, isInitialLoad);
    return () => abortControllerRef.current?.abort();
  }, [currentPage, fetchNotes]);

  // Auto-advance pages like a carousel when there is more than one page.
  // Wraps back to the first page after the last. Paused while a modal is open.
  const totalPages = data?.pagination.totalPages ?? 1;
  useEffect(() => {
    if (totalPages <= 1 || editModalOpen || deleteModalOpen) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev >= totalPages ? 1 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [totalPages, editModalOpen, deleteModalOpen]);

  const handlePrevPage = useCallback(() => {
    if (data?.pagination.hasPrev && !isPaginating) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [data?.pagination.hasPrev, isPaginating]);

  const handleNextPage = useCallback(() => {
    if (data?.pagination.hasNext && !isPaginating) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [data?.pagination.hasNext, isPaginating]);

  // Modal handlers
  const handleEdit = (message: Message) => {
    setSelectedMessage(message);
    setEditModalOpen(true);
  };

  const handleDelete = (message: Message) => {
    setSelectedMessage(message);
    setDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedMessage(null);
  };

  const handleModalSuccess = () => {
    // Refresh the current page to show updated data
    fetchNotes(currentPage, false);
    handleModalClose();
  };

  if (loading) {
    return <LoadingSpinner message="Loading notes..." />;
  }

  if (error) {
    return (
      <div className="note-section-error">
        <div className="error-message">Error loading notes: {error}</div>
      </div>
    );
  }

  if (!data || data.messages.length === 0) {
    return (
      <div>
        <p>No notes! Leave a note?</p>
      </div>
    );
  }

  return (
    <div className="guest-book-note-section">
      {/* Notes display */}
      <div
        className="notes-display"
        style={{
          opacity: isPaginating ? 0.6 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <div className="pagination-nav-left pagination-nav-desktop">
          {data.pagination.hasPrev ? (
            <ArrowButton
              direction="left"
              className="section-nav-button"
              onClick={handlePrevPage}
            />
          ) : (
            <div className="nav-spacer"></div>
          )}
        </div>
        {data.messages.map((message) => (
          <GuestBookNote
            key={message.id}
            message={message}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        <div className="pagination-nav-right pagination-nav-desktop">
          {data.pagination.hasNext ? (
            <ArrowButton
              direction="right"
              className="section-nav-button"
              onClick={handleNextPage}
            />
          ) : (
            <div className="nav-spacer"></div>
          )}
        </div>
      </div>

      {/* Pagination navigation bar */}
      <div className="pagination-nav">
        {/* Left navigation arrow */}
        <div className="pagination-nav-left pagination-nav-mobile">
          {data.pagination.hasPrev ? (
            <ArrowButton
              direction="left"
              className="section-nav-button"
              onClick={handlePrevPage}
            />
          ) : (
            <div className="nav-spacer"></div>
          )}
        </div>

        {/* Pagination info */}
        <div className="pagination-info">
          {isPaginating
            ? "Loading..."
            : `${data.pagination.page} / ${data.pagination.totalPages}`}
        </div>

        {/* Right navigation arrow */}
        <div className="pagination-nav-right pagination-nav-mobile">
          {data.pagination.hasNext ? (
            <ArrowButton
              direction="right"
              className="section-nav-button"
              onClick={handleNextPage}
            />
          ) : (
            <div className="nav-spacer"></div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedMessage && (
        <>
          <EditMessageLightbox
            message={selectedMessage}
            isOpen={editModalOpen}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
          <DeleteConfirmationModal
            message={selectedMessage}
            isOpen={deleteModalOpen}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        </>
      )}
    </div>
  );
});

GuestBookNoteSection.displayName = "GuestBookNoteSection";

export default GuestBookNoteSection;
