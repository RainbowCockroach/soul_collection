import React, { useState } from "react";
import type { Message } from "./types";
import "./GuestBookFanArt.css";

interface GuestBookFanArtProps {
  message: Message;
}

const GuestBookFanArt: React.FC<GuestBookFanArtProps> = ({ message }) => {
  const [showFullImage, setShowFullImage] = useState(false);

  const handleMagnifyClick = () => {
    setShowFullImage(true);
  };

  const handleCloseModal = () => {
    setShowFullImage(false);
  };

  const displayImage = message.content.thumbnail || message.content.full_image;
  const fullImage = message.content.full_image || message.content.thumbnail;

  return (
    <>
      <div className="guest-book-fanart">
        {/* Blinkie positioned above the frame */}
        {message.content.blinkie && (
          <div className="fanart-blinkie">
            <img
              src={message.content.blinkie}
              alt="Blinkie"
              className="blinkie-image"
            />
          </div>
        )}

        {/* Window-like frame container */}
        <div className="fanart-window-frame">
          {/* Magnifier glass icon */}
          <button
            className="magnifier-icon"
            onClick={handleMagnifyClick}
            aria-label="View full image"
            title="Click to view full image"
          >
            🔍
          </button>

          {/* Image display area */}
          <div
            className="fanart-image-container"
            style={{
              backgroundImage: displayImage ? `url(${displayImage})` : undefined,
            }}
            onClick={handleMagnifyClick}
          >
            {!displayImage && (
              <div className="fanart-placeholder">
                <span>No Image</span>
              </div>
            )}

            {/* Artist info and caption - overlay on image */}
            <div className="fanart-info">
              <div className="fanart-header">
                <span className="fanart-artist">{message.content.name}</span>
                <span className="fanart-date">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
              </div>

              {message.content.caption && (
                <div className="fanart-caption">{message.content.caption}</div>
              )}

              {message.content.content && (
                <div className="fanart-description">{message.content.content}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full image modal */}
      {showFullImage && fullImage && (
        <div className="fanart-modal" onClick={handleCloseModal}>
          <div className="fanart-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="fanart-modal-close"
              onClick={handleCloseModal}
              aria-label="Close full image"
            >
              �
            </button>
            <img
              src={fullImage}
              alt={message.content.caption || `Fan art by ${message.content.name}`}
              className="fanart-modal-image"
            />
            <div className="fanart-modal-info">
              <h3>{message.content.name}</h3>
              {message.content.caption && <p>{message.content.caption}</p>}
              {message.content.content && <p>{message.content.content}</p>}
              <p className="fanart-modal-date">
                Posted: {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuestBookFanArt;