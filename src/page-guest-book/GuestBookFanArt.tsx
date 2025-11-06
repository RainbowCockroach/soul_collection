import { forwardRef, useImperativeHandle } from "react";
import type { Message } from "./types";
import "./GuestBookFanArt.css";

interface GuestBookFanArtProps {
  message: Message;
}

export interface GuestBookFanArtRef {
  openImageInNewTab: () => void;
}

const GuestBookFanArt = forwardRef<GuestBookFanArtRef, GuestBookFanArtProps>(({ message }, ref) => {
  const openImageInNewTab = () => {
    const fullImage = message.content.full_image || message.content.thumbnail;
    if (fullImage) {
      window.open(fullImage, '_blank');
    }
  };

  useImperativeHandle(ref, () => ({
    openImageInNewTab,
  }));

  const displayImage = message.content.thumbnail || message.content.full_image;

  return (
    <div className="guest-book-fanart">
      {/* Blinkies positioned above the frame */}
      {message.content.blinkies && message.content.blinkies.length > 0 && (
        <div className="fanart-blinkies">
          {message.content.blinkies.slice(0, 3).map((blinkieUrl, index) => (
            <div key={index} className="fanart-blinkie">
              <img
                src={blinkieUrl}
                alt={`Blinkie ${index + 1}`}
                className="blinkie-image"
              />
            </div>
          ))}
        </div>
      )}

      {/* Window-like frame container */}
      <div className="fanart-window-frame">
        {/* Image display area */}
        <div
          className="fanart-image-container"
          style={{
            backgroundImage: displayImage
              ? `url(${displayImage})`
              : undefined,
          }}
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
          </div>
        </div>
      </div>
    </div>
  );
});

GuestBookFanArt.displayName = "GuestBookFanArt";

export default GuestBookFanArt;
