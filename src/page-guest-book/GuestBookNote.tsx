import React from "react";
import type { Message } from "./types";
import "./GuestBookNote.css";

interface GuestBookNoteProps {
  message: Message;
}

const GuestBookNote: React.FC<GuestBookNoteProps> = ({ message }) => {
  return (
    <div className="guest-book-note">
      {/* Blinkie on top of the note */}
      {message.content.blinkie && (
        <div className="note-blinkie">
          <img
            src={message.content.blinkie}
            alt="Blinkie"
            className="blinkie-image"
          />
        </div>
      )}

      {/* Paper note container */}
      <div className="note-paper">
        <div className="note-header">
          <span className="note-name">{message.content.name}</span>
          <span className="note-date">
            {new Date(message.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="note-content">
          {message.content.content}
        </div>

        {/* Optional thumbnail/image if present */}
        {message.content.thumbnail && (
          <div className="note-image">
            <img
              src={message.content.thumbnail}
              alt={message.content.caption || "Note image"}
              className="note-thumbnail"
            />
            {message.content.caption && (
              <div className="note-caption">{message.content.caption}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestBookNote;