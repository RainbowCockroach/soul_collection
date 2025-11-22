import { forwardRef, useImperativeHandle, useMemo, useState, useEffect } from "react";
import ActionMenu from "./ActionMenu";
import type { Message } from "./types";
import { useBlurImage } from "../hooks/usePixelatedImage";
import "./GuestBookFanArt.css";

interface GuestBookFanArtProps {
  message: Message;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onOpenFullscreenViewer?: (message: Message) => void;
}

export interface GuestBookFanArtRef {
  openImageInNewTab: () => void;
  openFullscreenViewer: () => void;
}

const GuestBookFanArt = forwardRef<GuestBookFanArtRef, GuestBookFanArtProps>(
  ({ message, onEdit, onDelete, onOpenFullscreenViewer }, ref) => {
    const [isImageUncensored, setIsImageUncensored] = useState(false);

    // Generate unique ID for this component instance
    const clipId = useMemo(
      () =>
        `arch-clip-${message.id || Math.random().toString(36).slice(2, 11)}`,
      [message.id]
    );

    const openImageInNewTab = () => {
      const fullImage = message.content.full_image || message.content.thumbnail;
      if (fullImage) {
        window.open(fullImage, "_blank");
      }
    };

    const openFullscreenViewer = () => {
      onOpenFullscreenViewer?.(message);
    };

    const handleEdit = () => {
      onEdit?.(message);
    };

    const handleDelete = () => {
      onDelete?.(message);
    };

    useImperativeHandle(ref, () => ({
      openImageInNewTab,
      openFullscreenViewer,
    }));

    const displayImage =
      message.content.thumbnail || message.content.full_image;

    // Apply pixelation if content warning exists and image is not uncensored
    const { url: processedImage, useCssFilter } = useBlurImage(
      displayImage || "",
      isImageUncensored ? undefined : message.content.content_warning || undefined
    );

    // Reset uncensor state when content warning changes
    useEffect(() => {
      setIsImageUncensored(false);
    }, [message.content.content_warning]);

    return (
      <div className="guest-book-fanart">
        {/* SVG Clip Path Definition - Responsive with objectBoundingBox */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d="M 0,1 L 0,0.375 A 0.5,0.375 0 0,1 1,0.375 L 1,1 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Blinkies positioned above the frame */}
        {message.content.blinkies && message.content.blinkies.length > 0 && (
          <div className="fanart-blinkies">
            {message.content.blinkies.slice(0, 3).map((blinkieUrl, index) => (
              <div key={index} className="fanart-blinkie flex-center">
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
          {/* Action menu for edit/delete */}
          {(onEdit || onDelete) && (
            <ActionMenu
              onEdit={handleEdit}
              onDelete={handleDelete}
              className="fanart-action-menu"
            />
          )}

          {/* Image display area */}
          <div
            className="fanart-image-container flex-center"
            style={{
              backgroundImage: displayImage
                ? `url(${processedImage})`
                : undefined,
              clipPath: `url(#${clipId})`,
              ...(useCssFilter
                ? {
                    filter: "blur(20px) brightness(0.8) contrast(1.1)",
                  }
                : {}),
            }}
          >
            {!displayImage && (
              <div
                className="fanart-placeholder flex-center "
                style={{
                  clipPath: `url(#${clipId})`,
                }}
              >
                <span>No Image</span>
              </div>
            )}

            {/* Artist info and caption - overlay on image */}
            <div className="fanart-info">
              <div className="fanart-header">
                <span className="fanart-artist  text-shadow-dark">
                  {message.content.name}
                </span>
                <span className="fanart-date  text-shadow-dark">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
              </div>

              {message.content.caption && (
                <div className="fanart-caption  text-shadow-dark">
                  {message.content.caption}
                </div>
              )}
            </div>
          </div>

          {/* Content Warning Overlay */}
          {message.content.content_warning && !isImageUncensored && (
            <div className="fanart-content-warning-overlay">
              <div className="fanart-content-warning-card">
                <div className="fanart-content-warning-text">
                  <strong>This contains:</strong> {message.content.content_warning}
                </div>
                <button
                  className="fanart-uncensor-button"
                  onClick={() => setIsImageUncensored(true)}
                >
                  Show!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

GuestBookFanArt.displayName = "GuestBookFanArt";

export default GuestBookFanArt;
