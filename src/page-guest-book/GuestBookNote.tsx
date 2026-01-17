import React, { useState, useRef, useCallback } from "react";
import ActionMenu from "./ActionMenu";
import type { Message } from "./types";
import "./GuestBookNote.css";

interface GuestBookNoteProps {
  message: Message;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

const HOLD_DURATION = 300; // ms to hold before showing menu

const GuestBookNote: React.FC<GuestBookNoteProps> = ({
  message,
  onEdit,
  onDelete,
}) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEdit = () => {
    onEdit?.(message);
  };

  const handleDelete = () => {
    onDelete?.(message);
  };

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
      className={`guest-book-note ${showActionMenu ? "show-action-menu" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
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
              />
            </div>
          ))}
        </div>
      )}

      {/* Paper note container */}
      <div className="note-paper div-3d-with-shadow">
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
