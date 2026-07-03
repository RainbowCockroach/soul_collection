import React, { useState, useEffect } from "react";
import ActionMenu from "./ActionMenu";
import ButtonWrapper from "../common-components/ButtonWrapper";
import type { Message } from "./types";
import { useBlurImage } from "../hooks/usePixelatedImage";
import { useHoldToReveal } from "../hooks/useHoldToReveal";
import "./GuestBookFanArt.css";

interface GuestBookFanArtProps {
  message: Message;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onOpenFullscreenViewer?: (message: Message) => void;
}

const GuestBookFanArt: React.FC<GuestBookFanArtProps> = ({
  message,
  onEdit,
  onDelete,
  onOpenFullscreenViewer,
}) => {
  const [isImageUncensored, setIsImageUncensored] = useState(false);
  const { showMenu: showActionMenu, touchHandlers } = useHoldToReveal();

  // Stable unique ID for the SVG clip path (message.id is unique per card).
  const clipId = `arch-clip-${message.id}`;

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

  // Only show the date when `created_at` parses to a real date. Placeholder
  // ("dummy") cards carry an empty created_at and must not render "Invalid Date".
  const createdDate = message.created_at
    ? new Date(message.created_at)
    : null;
  const dateLabel =
    createdDate && !isNaN(createdDate.getTime())
      ? createdDate.toLocaleDateString()
      : null;
  const hasInfo = Boolean(
    message.content.name || dateLabel || message.content.caption,
  );

  // Apply pixelation if content warning exists and image is not uncensored
  const { url: processedImage, useCssFilter, displayWarning } = useBlurImage(
    displayImage || "",
    isImageUncensored
      ? undefined
      : message.content.content_warning || undefined
  );

  // Reset uncensor state when content warning changes
  useEffect(() => {
    setIsImageUncensored(false);
  }, [message.content.content_warning]);

  return (
    <div
      className={`guest-book-fanart ${showActionMenu ? "show-action-menu" : ""}`}
      {...touchHandlers}
    >
      {/* SVG Clip Path Definition - Responsive with objectBoundingBox */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M 0,1 L 0,0.375 A 0.5,0.375 0 0,1 1,0.375 L 1,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Frame, fullscreen zone, content-warning overlay and action menu are
          siblings so the uncensor / action buttons are never nested inside the
          fullscreen <button> (invalid HTML). */}
      <div className="fanart-frame-wrapper">
        <div className="fanart-window-frame effect-subtle-rise">
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
            {hasInfo && (
              <div className="fanart-info">
                <div className="fanart-header">
                  <span className="fanart-artist text-shadow-dark">
                    {message.content.name}
                  </span>
                  {dateLabel && (
                    <span className="fanart-date text-shadow-dark">
                      {dateLabel}
                    </span>
                  )}
                </div>

                {message.content.caption && (
                  <div className="fanart-caption text-shadow-dark">
                    {message.content.caption}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Transparent overlay covering only the top of the image - clicking
            opens fullscreen. Leaves the lower-right free for the action menu. */}
        <ButtonWrapper
          onClick={handleOpenFullscreen}
          className="fanart-fullscreen-zone"
          tooltip="Click to expand"
        >
          <span className="sr-only">View full screen</span>
        </ButtonWrapper>

        {/* Content Warning Overlay - sibling of the fullscreen button */}
        {useCssFilter && !isImageUncensored && (
          <div className="fanart-content-warning-overlay">
            <div className="fanart-content-warning-card">
              <div className="fanart-content-warning-text">
                <strong>This contains:</strong> {displayWarning}
              </div>
              <button
                type="button"
                className="fanart-uncensor-button"
                onClick={() => setIsImageUncensored(true)}
                aria-label={`Reveal content warning: ${displayWarning}`}
              >
                Show!
              </button>
            </div>
          </div>
        )}

        {/* Action menu - lower right of the image, above the fullscreen zone */}
        {(onEdit || onDelete) && (
          <ActionMenu
            onEdit={handleEdit}
            onDelete={handleDelete}
            className="fanart-action-menu"
          />
        )}
      </div>
    </div>
  );
};

export default GuestBookFanArt;
