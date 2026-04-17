import React from "react";

interface ReorderButtonsProps {
  index: number;
  total: number;
  onMove: (index: number, direction: -1 | 1) => void;
}

const ReorderButtons: React.FC<ReorderButtonsProps> = ({
  index,
  total,
  onMove,
}) => {
  return (
    <div
      className="editor-reorder-buttons"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="editor-reorder-button"
        onClick={() => onMove(index, -1)}
        disabled={index === 0}
        aria-label="Move up"
        title="Move up"
      >
        ▲
      </button>
      <button
        type="button"
        className="editor-reorder-button"
        onClick={() => onMove(index, 1)}
        disabled={index === total - 1}
        aria-label="Move down"
        title="Move down"
      >
        ▼
      </button>
    </div>
  );
};

export default ReorderButtons;
