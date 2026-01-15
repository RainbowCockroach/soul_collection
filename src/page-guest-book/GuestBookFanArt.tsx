import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import ActionMenu from "./ActionMenu";
import ButtonWrapper from "../common-components/ButtonWrapper";
import type { Message } from "./types";
import { useBlurImage } from "../hooks/usePixelatedImage";
import "./GuestBookFanArt.css";

interface GuestBookFanArtProps {
  message: Message;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onOpenFullscreenViewer?: (message: Message) => void;
}

const HOLD_DURATION = 300; // ms to hold before showing menu

const GuestBookFanArt: React.FC<GuestBookFanArtProps> = ({
  message,
  onEdit,
  onDelete,
  onOpenFullscreenViewer,
}) => {
  const [isImageUncensored, setIsImageUncensored] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate unique ID for this component instance
  const clipId = useMemo(
    () =>
      `arch-clip-${message.id || Math.random().toString(36).slice(2, 11)}`,
    [message.id]
  );

  const handleOpenFullscreen = () => {
    onOpenFullscreenViewer?.(message);
  };

  const handleEdit = () => {
    onEdit?.(message);
  };

  const handleDelete = () => {
    onDelete?.(message);
  };

  const displayImage =
    message.content.thumbnail || message.content.full_image;

  // Apply pixelation if content warning exists and image is not uncensored
  const { url: processedImage, useCssFilter } = useBlurImage(
    displayImage || "",
    isImageUncensored
      ? undefined
      : message.content.content_warning || undefined
  );

  // Reset uncensor state when content warning changes
  useEffect(() => {
    setIsImageUncensored(false);
  }, [message.content.content_warning]);

  // Touch handlers for showing action menu on hold
  const handleTouchStart = useCallback(() => {
    holdTimerRef.current = setTimeout(() => {
      setShowActionMenu(true);
    }, HOLD_DURATION);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    // Keep menu visible for a bit after touch ends so user can interact with it
    setTimeout(() => {
      setShowActionMenu(false);
    }, 3000);
  }, []);

  const handleTouchCancel = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setShowActionMenu(false);
  }, []);

  return (
    <div
      className={`guest-book-fanart ${showActionMenu ? "show-action-menu" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* SVG Clip Path Definition - Responsive with objectBoundingBox */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M 0,1 L 0,0.375 A 0.5,0.375 0 0,1 1,0.375 L 1,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Window frame wrapped in ButtonWrapper - clicking opens fullscreen */}
      <ButtonWrapper onClick={handleOpenFullscreen} className="fanart-button">
        <div className="fanart-window-frame">
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
                className="fanart-placeholder flex-center"
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
                <span className="fanart-artist text-shadow-dark">
                  {message.content.name}
                </span>
                <span className="fanart-date text-shadow-dark">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
              </div>

              {message.content.caption && (
                <div className="fanart-caption text-shadow-dark">
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
                  <strong>This contains:</strong>{" "}
                  {message.content.content_warning}
                </div>
                <button
                  className="fanart-uncensor-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageUncensored(true);
                  }}
                >
                  Show!
                </button>
              </div>
            </div>
          )}
        </div>
      </ButtonWrapper>

      {/* Action menu below the image - separate from the fullscreen button */}
      {(onEdit || onDelete) && (
        <ActionMenu
          onEdit={handleEdit}
          onDelete={handleDelete}
          className="fanart-action-menu"
        />
      )}
    </div>
  );
};

export default GuestBookFanArt;
