import React from "react";
import type { Message } from "./types";
import "./GuestBookNote.css";

interface GuestBookNoteProps {
  message: Message;
}

const GuestBookNote: React.FC<GuestBookNoteProps> = ({ message }) => {
  return (
    <div className="guest-book-note">
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