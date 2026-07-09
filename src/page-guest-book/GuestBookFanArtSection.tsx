import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { Message } from "./types";
import GuestBookFanArt from "./GuestBookFanArt";
import EditMessageLightbox from "./EditMessageLightbox";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ArrowButton from "../common-components/ArrowButton";
import { apiBaseUrl } from "../helpers/constants";
import "./GuestBookFanArtSection.css";
import LoadingSpinner from "../common-components/LoadingSpinner";
import guestbookArtPlaceholder from "../assets/guestbook_art_placeholder.webp";
import guestbookArtPlaceholderDetail from "../assets/guestbook_art_placeholder_detail.webp";

// Placeholder ("dummy") fan art shown when a page has fewer than `fanArtPerPage`
// real submissions, or when there are no submissions at all. Negative ids keep
// them from colliding with real message ids and mark them as non-interactive
// (no edit/delete actions). See `isPlaceholderMessage`.
const makePlaceholderMessage = (index: number): Message => ({
  id: -1 - index,
  content: {
    name: null,
    content: null,
    thumbnail: guestbookArtPlaceholder,
    full_image: guestbookArtPlaceholderDetail,
    caption: null,
  },
  created_at: "",
  updated_at: "",
  expire_at: "",
  type: "fan art",
  password: null,
  uploaded_path: null,
});

const isPlaceholderMessage = (message: Message): boolean => message.id < 0;

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

interface GuestBookFanArtSectionProps {
  fanArtPerPage?: number;
  onOpenFullscreenViewer?: (message: Message) => void;
}

export interface GuestBookFanArtSectionRef {
  refresh: () => void;
}

const GuestBookFanArtSection = forwardRef<
  GuestBookFanArtSectionRef,
  GuestBookFanArtSectionProps
>(({ fanArtPerPage = 4, onOpenFullscreenViewer }, ref) => {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginating, setIsPaginating] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasInitiallyLoaded = useRef(false);
  // Single in-flight controller so fetches can't race and overwrite each other.
  const abortControllerRef = useRef<AbortController | null>(null);

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Fetch fan art for the current page
  const fetchFanArt = useCallback(
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
          `${apiBaseUrl}/messages?type=fan%20art&page=${page}&limit=${fanArtPerPage}`,
          { signal },
        );

        if (!response.ok) {
          throw new Error("Failed to load arts");
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
    [fanArtPerPage],
  );

  // Expose refresh function to parent component
  useImperativeHandle(
    ref,
    () => ({
      refresh: () => fetchFanArt(currentPage, false),
    }),
    [fetchFanArt, currentPage],
  );

  useEffect(() => {
    const isInitialLoad = !hasInitiallyLoaded.current;
    fetchFanArt(currentPage, isInitialLoad);
    return () => abortControllerRef.current?.abort();
  }, [currentPage, fetchFanArt]);

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
  const handleEdit = useCallback((message: Message) => {
    setSelectedMessage(message);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((message: Message) => {
    setSelectedMessage(message);
    setDeleteModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedMessage(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    // Refresh the current page to show updated data
    const isInitialLoad = !hasInitiallyLoaded.current;
    fetchFanArt(currentPage, isInitialLoad);
    handleModalClose();
  }, [currentPage, fetchFanArt, handleModalClose]);

  if (loading) {
    return <LoadingSpinner message="Loading art..." />;
  }

  if (error) {
    return (
      <div className="fanart-section-error">
        <div className="error-message">Error loading art: {error}</div>
      </div>
    );
  }

  // Real submissions on the current page, padded with placeholder cards so the
  // page always shows `fanArtPerPage` cards. When there are no submissions at
  // all we still render a full dummy page rather than an empty-state message.
  const realMessages = data?.messages ?? [];
  const hasRealArt = realMessages.length > 0;
  const placeholderCount = Math.max(0, fanArtPerPage - realMessages.length);
  const displayMessages: Message[] = [
    ...realMessages,
    ...Array.from({ length: placeholderCount }, (_, i) =>
      makePlaceholderMessage(i),
    ),
  ];

  const prevArrow = data?.pagination.hasPrev ? (
    <ArrowButton
      direction="left"
      className="section-nav-button"
      onClick={handlePrevPage}
    />
  ) : (
    <div className="nav-spacer"></div>
  );

  const nextArrow = data?.pagination.hasNext ? (
    <ArrowButton
      direction="right"
      className="section-nav-button"
      onClick={handleNextPage}
    />
  ) : (
    <div className="nav-spacer"></div>
  );

  return (
    <div className="guest-book-fanart-section gb-paginated" ref={sectionRef}>
      {/* Top arrow pair — shown on desktop where the section is a narrow column */}
      <div className="gb-nav-top">
        {prevArrow}
        {nextArrow}
      </div>

      {/* Fan art grid spans the full width; arrows live on the pagination line */}
      <div className="gb-items-row">
        <div
          className="fanart-display"
          style={{
            opacity: isPaginating ? 0.6 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          {displayMessages.map((message) => {
            const placeholder = isPlaceholderMessage(message);
            return (
              <GuestBookFanArt
                key={message.id}
                message={message}
                onEdit={placeholder ? undefined : handleEdit}
                onDelete={placeholder ? undefined : handleDelete}
                onOpenFullscreenViewer={onOpenFullscreenViewer}
              />
            );
          })}
        </div>
      </div>

      {/* Pagination line - only shown when real art exists. Arrows flank the
          page index on mobile. */}
      {hasRealArt && (
        <div className="gb-nav-bottom">
          <div className="gb-nav-inline gb-nav-left">{prevArrow}</div>
          <div className="pagination-info">
            {isPaginating
              ? "Loading..."
              : `${data?.pagination.page} / ${data?.pagination.totalPages}`}
          </div>
          <div className="gb-nav-inline gb-nav-right">{nextArrow}</div>
        </div>
      )}

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

GuestBookFanArtSection.displayName = "GuestBookFanArtSection";

export default GuestBookFanArtSection;
