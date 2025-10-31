import React, { useState, useEffect } from "react";
import type { Message } from "./types";
import GuestBookNote from "./GuestBookNote";
import { apiBaseUrl } from "../helpers/constants";
import "./GuestBookNoteSection.css";

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
  notesPerPage = 4,
}) => {
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
        <div className="empty-message">No notes found. Be the first to leave one!</div>
      </div>
    );
  }

  return (
    <div className="guest-book-note-section">
      <div className="notes-container">
        {/* Left navigation arrow */}
        <button
          className={`nav-arrow nav-arrow-left ${
            !data.pagination.hasPrev ? "disabled" : ""
          }`}
          onClick={handlePrevPage}
          disabled={!data.pagination.hasPrev}
          aria-label="Previous page"
        >
          &#8249;
        </button>

        {/* Notes display */}
        <div className="notes-display">
          {data.messages.map((message) => (
            <GuestBookNote key={message.id} message={message} />
          ))}
        </div>

        {/* Right navigation arrow */}
        <button
          className={`nav-arrow nav-arrow-right ${
            !data.pagination.hasNext ? "disabled" : ""
          }`}
          onClick={handleNextPage}
          disabled={!data.pagination.hasNext}
          aria-label="Next page"
        >
          &#8250;
        </button>
      </div>

      {/* Pagination info */}
      <div className="pagination-info">
        Page {data.pagination.page} of {data.pagination.totalPages}
        {data.pagination.total > 0 && (
          <span className="total-count"> ({data.pagination.total} notes total)</span>
        )}
      </div>
    </div>
  );
};

export default GuestBookNoteSection;