import React from "react";
import ActionMenu from "./ActionMenu";
import type { Message } from "./types";
import { useHoldToReveal } from "../hooks/useHoldToReveal";
import "./GuestBookNote.css";

interface GuestBookNoteProps {
  message: Message;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

const GuestBookNote: React.FC<GuestBookNoteProps> = ({
  message,
  onEdit,
  onDelete,
}) => {
  const { showMenu: showActionMenu, touchHandlers } = useHoldToReveal();

  const handleEdit = () => {
    onEdit?.(message);
  };

  const handleDelete = () => {
    onDelete?.(message);
  };

  return (
    <div
      className={`guest-book-note ${showActionMenu ? "show-action-menu" : ""}`}
      {...touchHandlers}
    >
      {/* Blinkies on top of the note */}
      {message.content.blinkies && message.content.blinkies.length > 0 && (
        <div className="note-blinkies">
          {message.content.blinkies.slice(0, 3).map((blinkieUrl, index) => (
            <div key={index} className="note-blinkie">
              <img
                src={blinkieUrl}
                alt={`Blinkie ${index + 1}`}
                className="blinkie-image"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      )}

      {/* Paper note container */}
      <div className="note-paper div-3d-with-shadow effect-subtle-rise">
        {/* Action menu for edit/delete */}
        {(onEdit || onDelete) && (
          <ActionMenu
            onEdit={handleEdit}
            onDelete={handleDelete}
            className="note-action-menu"
          />
        )}

        <div className="note-header">
          <span className="note-name">{message.content.name}</span>
          <span className="note-date">
            {new Date(message.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="note-content">{message.content.content}</div>
      </div>
    </div>
  );
};

export default GuestBookNote;
