import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import blinkiesData from "../data/guestbook-blinkies.json";
import SavePushButton from "./SavePushButton";
import CopyToClipboardButton from "./CopyToClipboardButton";
import ReorderButtons from "./ReorderButtons";
import { arrayMove, trackMovedIndex } from "./reorder-utils";
import DeleteButton from "./DeleteButton";
import ImagePreview from "./ImagePreview";
import "./EditorCommon.css";

interface BlinkieListItemProps {
  url: string;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (from: number, to: number) => void;
}

const BlinkieListItem: React.FC<BlinkieListItemProps> = ({
  url,
  index,
  total,
  isSelected,
  onSelect,
  onDelete,
  onMove,
}) => {
  return (
    <div
      className={`editor-item ${isSelected ? "editor-item-selected" : ""}`}
      onClick={() => onSelect(index)}
    >
      <ReorderButtons index={index} total={total} onMoveTo={onMove} />
      <div className="editor-item-content" style={{ flex: 1 }}>
        {url ? (
          <img
            src={url}
            alt="Blinkie preview"
            className="editor-avatar"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <span className="editor-text-muted">No image</span>
        )}
      </div>
      <span onClick={(e) => e.stopPropagation()}>
        <DeleteButton onClick={() => onDelete(index)} title="Delete blinkie" />
      </span>
    </div>
  );
};

const EditorBlinkies: React.FC = () => {
  const [blinkies, setBlinkies] = useState<string[]>(
    () => blinkiesData as string[],
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSelect = (index: number) => {
    const blinkie = blinkies[index];
    if (blinkie !== undefined) {
      setSelectedIndex(index);
      setUrl(blinkie);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!url.trim()) {
      toast.error("Blinkie URL cannot be empty");
      return;
    }

    const trimmedUrl = url.trim();
    const updated = [...blinkies];
    if (isEditing && selectedIndex !== null) {
      updated[selectedIndex] = trimmedUrl;
    } else {
      updated.push(trimmedUrl);
    }

    setBlinkies(updated);
    toast.success(isEditing ? "Blinkie updated" : "Blinkie added");
    handleCancelEdit();
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this blinkie?")) {
      const updated = blinkies.filter((_, idx) => idx !== index);
      setBlinkies(updated);

      if (selectedIndex === index) {
        handleCancelEdit();
      } else if (selectedIndex !== null && selectedIndex > index) {
        setSelectedIndex(selectedIndex - 1);
      }
      toast.success("Blinkie deleted");
    }
  };

  const handleCancelEdit = () => {
    setSelectedIndex(null);
    setUrl("");
    setIsEditing(false);
  };

  const handleMove = (from: number, to: number) => {
    const moved = arrayMove(blinkies, from, to);
    if (moved === blinkies) return;
    setBlinkies(moved);
    setSelectedIndex(trackMovedIndex(selectedIndex, from, to));
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <div className="editor-button-group">
          <SavePushButton
            fileId="guestbook-blinkies"
            getData={() => blinkies}
          />
          <CopyToClipboardButton
            getData={() => blinkies}
            entityLabel="Blinkies JSON"
          />
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Blinkies ({blinkies.length})</h3>
            </div>
            {blinkies.length > 0 ? (
              blinkies.map((blinkie, index) => (
                <BlinkieListItem
                  key={`blinkie-${index}`}
                  url={blinkie}
                  index={index}
                  total={blinkies.length}
                  isSelected={selectedIndex === index}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  onMove={handleMove}
                />
              ))
            ) : (
              <div className="editor-empty-state">No blinkies yet</div>
            )}
          </div>
        </div>

        <div className="editor-right">
          <div className="editor-form">
            <h3>{isEditing ? "Edit Blinkie" : "Add New Blinkie"}</h3>

            <div className="editor-field">
              <label className="editor-label">Blinkie Image URL:</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/blinkie.gif"
                className="editor-input"
              />
            </div>

            <ImagePreview urls={[url]} />

            <div className="editor-button-group">
              <button
                onClick={handleSave}
                className="editor-button editor-button-success"
              >
                Save
              </button>
              {isEditing && (
                <button
                  onClick={handleCancelEdit}
                  className="editor-button editor-button-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorBlinkies;
