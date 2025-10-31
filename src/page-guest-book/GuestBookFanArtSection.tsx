import React, { useState, useEffect } from "react";
import type { Message } from "./types";
import GuestBookFanArt from "./GuestBookFanArt";
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
}

const GuestBookFanArtSection: React.FC<GuestBookFanArtSectionProps> = ({
  fanArtPerPage = 4,
}) => {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch fan art for the current page
  const fetchFanArt = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/messages?type=fan%20art&page=${page}&limit=${fanArtPerPage}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch fan art");
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
    fetchFanArt(currentPage);
  }, [currentPage, fanArtPerPage]);

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
      <div className="fanart-section-loading">
        <div className="loading-spinner">Loading fan art...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fanart-section-error">
        <div className="error-message">Error loading fan art: {error}</div>
      </div>
    );
  }

  if (!data || data.messages.length === 0) {
    return (
      <div className="fanart-section-empty">
        <div className="empty-message">
          No fan art found. Be the first to share your creation!
        </div>
      </div>
    );
  }

  return (
    <div className="guest-book-fanart-section">
      <h2>Your creations</h2>
      <div className="fanart-container">
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

        {/* Fan art display */}
        <div className="fanart-display">
          {data.messages.map((message) => (
            <GuestBookFanArt key={message.id} message={message} />
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
          <span className="total-count">
            {" "}
            ({data.pagination.total} fan art total)
          </span>
        )}
      </div>
    </div>
  );
};

export default GuestBookFanArtSection;
