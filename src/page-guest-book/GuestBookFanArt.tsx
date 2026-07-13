import React from "react";
import ActionMenu from "./ActionMenu";
import ButtonWrapper from "../common-components/ButtonWrapper";
import type { Message } from "./types";
import { useHoldToReveal } from "../hooks/useHoldToReveal";
import buttonSound from "/sound-effect/button_gallery_item.mp3";
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
  const { showMenu: showActionMenu, touchHandlers } = useHoldToReveal();

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

  return (
    <div
      className={`guest-book-fanart ${showActionMenu ? "show-action-menu" : ""}`}
      {...touchHandlers}
    >
      {/* Frame, fullscreen zone and action menu are siblings so the action
          buttons are never nested inside the fullscreen <button> (invalid
          HTML). */}
      <div className="fanart-frame-wrapper">
        {/* Image display area. */}
        <div className="fanart-image-container flex-center effect-subtle-rise">
          {displayImage && (
            <div
              className="fanart-image-layer"
              style={{ backgroundImage: `url(${displayImage})` }}
            />
          )}

          {!displayImage && (
            <div className="fanart-placeholder flex-center">
              <span>No Image</span>
            </div>
          )}
        </div>

        {/* Artist info and caption. On desktop this overlays the bottom of the
            image (absolute); on mobile it flows below the art so it never
            covers the drawing. Kept as a sibling of the image container so the
            mobile flow layout can push it out from under the picture. */}
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

        {/* Transparent overlay covering only the top of the image - clicking
            opens fullscreen. Leaves the lower-right free for the action menu. */}
        <ButtonWrapper
          onClick={handleOpenFullscreen}
          soundFile={buttonSound}
          className="fanart-fullscreen-zone"
          tooltip="Click to expand"
        >
          <span className="sr-only">View full screen</span>
        </ButtonWrapper>

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
