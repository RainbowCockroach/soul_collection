import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Message } from "./types";
import GuestBookFanArt, { type GuestBookFanArtRef } from "./GuestBookFanArt";
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
}

// Wrapper component to handle refs properly
const FanArtWithButton: React.FC<{ message: Message }> = ({ message }) => {
  const fanArtRef = useRef<GuestBookFanArtRef>(null);

  return (
    <ButtonWrapper
      onClick={() => {
        fanArtRef.current?.openImageInNewTab();
      }}
    >
      <GuestBookFanArt ref={fanArtRef} message={message} />
    </ButtonWrapper>
  );
};

const GuestBookFanArtSection: React.FC<GuestBookFanArtSectionProps> = ({
  fanArtPerPage = 4,
}) => {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginating, setIsPaginating] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasInitiallyLoaded = useRef(false);

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
          throw new Error("Failed to fetch fan art");
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
    <div className="guest-book-fanart-section" ref={sectionRef}>
      <div>
        <h2 className="big-text-shadow">Your art</h2>
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
          <FanArtWithButton key={message.id} message={message} />
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
    </div>
  );
};

export default GuestBookFanArtSection;
