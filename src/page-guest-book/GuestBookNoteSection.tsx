import React, { useState, useEffect } from "react";
import type { Message } from "./types";
import GuestBookNote from "./GuestBookNote";
import ArrowButton from "../common-components/ArrowButton";
import { apiBaseUrl } from "../helpers/constants";
import "./GuestBookNoteSection.css";

// Hook to get responsive notes per page - keeping 4 notes for both desktop and mobile
const useResponsiveNotesPerPage = (defaultNotesPerPage: number) => {
  // Always use the default number of notes per page (4) for consistency
  // Mobile will display them in a 2x2 grid layout instead of reducing the count
  return defaultNotesPerPage;
};

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

const GuestBookNoteSection: React.FC<GuestBookNoteSectionProps> = ({
  notesPerPage: defaultNotesPerPage = 4,
}) => {
  const notesPerPage = useResponsiveNotesPerPage(defaultNotesPerPage);
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch notes for the current page
  const fetchNotes = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/messages?type=note&page=${page}&limit=${notesPerPage}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const responseData = await response.json();
      setData(responseData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(currentPage);
  }, [currentPage, notesPerPage]);

  const handlePrevPage = () => {
    if (data?.pagination.hasPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.pagination.hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="note-section-loading">
        <div className="loading-spinner">Loading notes...</div>
      </div>
    );
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
      <div className="note-section-empty">
        <div className="empty-message">
          No notes found. Be the first to leave one!
        </div>
      </div>
    );
  }

  return (
    <div className="guest-book-note-section">
      {/* Notes display */}
      <div className="notes-display">
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
          <GuestBookNote key={message.id} message={message} />
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
          {data.pagination.page} / {data.pagination.totalPages}
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
    </div>
  );
};

export default GuestBookNoteSection;
