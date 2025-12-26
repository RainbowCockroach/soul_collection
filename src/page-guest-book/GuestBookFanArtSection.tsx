import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { Message } from "./types";
import GuestBookFanArt, { type GuestBookFanArtRef } from "./GuestBookFanArt";
import EditMessageLightbox from "./EditMessageLightbox";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ButtonWrapper from "../common-components/ButtonWrapper";
import ArrowButton from "../common-components/ArrowButton";
import { apiBaseUrl } from "../helpers/constants";
import "./GuestBookFanArtSection.css";

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
  editMode?: boolean;
  onOpenFullscreenViewer?: (message: Message) => void;
}

export interface GuestBookFanArtSectionRef {
  refresh: () => void;
}

// Wrapper component to handle refs properly
const FanArtWithButton: React.FC<{
  message: Message;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onOpenFullscreenViewer?: (message: Message) => void;
  editMode?: boolean;
}> = ({
  message,
  onEdit,
  onDelete,
  onOpenFullscreenViewer,
  editMode = false,
}) => {
  const fanArtRef = useRef<GuestBookFanArtRef>(null);

  const handleClick = () => {
    fanArtRef.current?.openFullscreenViewer();
  };

  // In edit mode, render without ButtonWrapper to allow action menu clicks
  if (editMode) {
    return (
      <GuestBookFanArt
        ref={fanArtRef}
        message={message}
        onEdit={onEdit}
        onDelete={onDelete}
        onOpenFullscreenViewer={onOpenFullscreenViewer}
      />
    );
  }

  // In normal mode, wrap with ButtonWrapper for click-to-open functionality
  return (
    <ButtonWrapper onClick={handleClick} className="">
      <GuestBookFanArt
        ref={fanArtRef}
        message={message}
        onEdit={onEdit}
        onDelete={onDelete}
        onOpenFullscreenViewer={onOpenFullscreenViewer}
      />
    </ButtonWrapper>
  );
};

const GuestBookFanArtSection = forwardRef<
  GuestBookFanArtSectionRef,
  GuestBookFanArtSectionProps
>(({ fanArtPerPage = 4, editMode = false, onOpenFullscreenViewer }, ref) => {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginating, setIsPaginating] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasInitiallyLoaded = useRef(false);

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Fetch fan art for the current page
  const fetchFanArt = useCallback(
    async (page: number, isInitialLoad: boolean = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setIsPaginating(true);
        }

        const response = await fetch(
          `${apiBaseUrl}/messages?type=fan%20art&page=${page}&limit=${fanArtPerPage}`
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
        setError(err instanceof Error ? err.message : "An error occurred");
        setData(null);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setIsPaginating(false);
        }
      }
    },
    [fanArtPerPage]
  );

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refresh: () => fetchFanArt(currentPage, false),
  }));

  useEffect(() => {
    const isInitialLoad = !hasInitiallyLoaded.current;
    fetchFanArt(currentPage, isInitialLoad);
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
    return (
      <div className="fanart-section-loading">
        <div className="loading-spinner">Loading art...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fanart-section-error">
        <div className="error-message">Error loading art: {error}</div>
      </div>
    );
  }

  if (!data || data.messages.length === 0) {
    return (
      <div className="guest-book-fanart-section" ref={sectionRef}>
        <div>
          <h1 className="big-text-shadow">Your art</h1>
        </div>
        <p>No art? Put your art here!</p>
      </div>
    );
  }

  return (
    <div className="guest-book-fanart-section" ref={sectionRef}>
      <div>
        <h1 className="big-text-shadow">Your art</h1>
      </div>

      {/* Fan art display with navigation */}
      <div
        className="fanart-display"
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
          <FanArtWithButton
            key={message.id}
            message={message}
            onEdit={editMode ? handleEdit : undefined}
            onDelete={editMode ? handleDelete : undefined}
            onOpenFullscreenViewer={onOpenFullscreenViewer}
            editMode={editMode}
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

GuestBookFanArtSection.displayName = "GuestBookFanArtSection";

export default GuestBookFanArtSection;
