import React, { useEffect, useRef, useState } from "react";

interface ReorderButtonsProps {
  index: number;
  total: number;
  onMoveTo: (from: number, to: number) => void;
}

const ReorderButtons: React.FC<ReorderButtonsProps> = ({
  index,
  total,
  onMoveTo,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (!Number.isNaN(parsed)) {
      const target = Math.max(1, Math.min(total, parsed)) - 1;
      if (target !== index) onMoveTo(index, target);
    }
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  const startEditing = () => {
    setDraft(String(index + 1));
    setEditing(true);
  };

  return (
    <div
      className="editor-reorder-buttons"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="editor-reorder-arrows">
        <button
          type="button"
          className="editor-reorder-button"
          onClick={() => onMoveTo(index, index - 1)}
          disabled={index === 0}
          aria-label="Move up"
          title="Move up"
        >
          ▲
        </button>
        <button
          type="button"
          className="editor-reorder-button"
          onClick={() => onMoveTo(index, index + 1)}
          disabled={index === total - 1}
          aria-label="Move down"
          title="Move down"
        >
          ▼
        </button>
      </div>
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          className="editor-reorder-index-input"
          min={1}
          max={total}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          aria-label={`Move to position (1 to ${total})`}
        />
      ) : (
        <button
          type="button"
          className="editor-reorder-index"
          onClick={startEditing}
          title={`Position ${index + 1} of ${total} — click to move to a specific position`}
          aria-label={`Position ${index + 1} of ${total}. Click to move.`}
        >
          {index + 1}
        </button>
      )}
    </div>
  );
};

export default ReorderButtons;
