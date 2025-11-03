import React, { useState, useEffect, useRef } from "react";
import type { Message } from "./types";
import GuestBookFanArt, { type GuestBookFanArtRef } from "./GuestBookFanArt";
import ButtonWrapper from "../common-components/ButtonWrapper";
import { apiBaseUrl } from "../helpers/constants";
import "./GuestBookFanArtSection.css";

interface GuestBookFanArtSectionProps {
  fanArtCount?: number;
  refreshIntervalMs?: number;
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
  fanArtCount = 4,
  refreshIntervalMs = 30000, // Default: refresh every 30 seconds
}) => {
  const [fanArtMessages, setFanArtMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch random fan art
  const fetchRandomFanArt = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl}/messages/random/fan-art?count=${fanArtCount}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch random fan art");
      }

      const responseData = await response.json();
      setFanArtMessages(responseData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setFanArtMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Setup interval for automatic refresh
  useEffect(() => {
    // Initial fetch
    fetchRandomFanArt();

    // Setup interval for periodic refresh
    if (refreshIntervalMs > 0) {
      intervalRef.current = setInterval(fetchRandomFanArt, refreshIntervalMs);
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fanArtCount, refreshIntervalMs]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchRandomFanArt();
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
        <ButtonWrapper onClick={handleRefresh}>
          <div className="refresh-button">Try Again</div>
        </ButtonWrapper>
      </div>
    );
  }

  if (fanArtMessages.length === 0) {
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
      <div>
        <h2>Your creations</h2>
      </div>

      <div className="fanart-container">
        {/* Fan art display */}
        <div className="fanart-display">
          {fanArtMessages.map((message) => (
            <FanArtWithButton key={message.id} message={message} />
          ))}
        </div>
      </div>

      {/* Auto-refresh info */}
      <div className="refresh-info">
        Refreshes automatically every {Math.round(refreshIntervalMs / 1000)}{" "}
        seconds
      </div>
    </div>
  );
};

export default GuestBookFanArtSection;
