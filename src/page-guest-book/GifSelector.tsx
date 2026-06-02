import { useState, useRef, useEffect, useId } from "react";
import "./GifSelector.css";

interface GifSelectorProps {
  availableGifs: string[];
  selectedGifs: string[];
  onSelectionChange: (selectedGifs: string[]) => void;
  maxSelection?: number;
  label?: string;
}

const GifSelector = ({
  availableGifs,
  selectedGifs,
  onSelectionChange,
  maxSelection = 3,
  label = "GIFs (optional)",
}: GifSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLButtonElement>(null);
  const gridId = useId();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    // Close on Escape and return focus to the tray toggle (keyboard users)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isExpanded) {
        setIsExpanded(false);
        trayRef.current?.focus();
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  const handleTrayClick = () => {
    setIsExpanded(!isExpanded);
  };

  // Toggle a GIF in the grid: remove it if already selected, otherwise add it
  // (when under the max). This keeps every action reachable by keyboard.
  const handleGifToggle = (gifUrl: string) => {
    const index = selectedGifs.indexOf(gifUrl);
    if (index !== -1) {
      const newSelection = [...selectedGifs];
      newSelection.splice(index, 1);
      onSelectionChange(newSelection);
    } else if (selectedGifs.length < maxSelection) {
      onSelectionChange([...selectedGifs, gifUrl]);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const canSelectMore = selectedGifs.length < maxSelection;

  return (
    <div className="gif-selector" ref={containerRef}>
      {label && (
        <span className="gif-selector-label" id={`${gridId}-label`}>
          {label}
        </span>
      )}

      {/* Tray (toggle) */}
      <button
        type="button"
        ref={trayRef}
        className={`gif-tray ${isExpanded ? "expanded" : "collapsed"}`}
        onClick={handleTrayClick}
        aria-expanded={isExpanded}
        aria-controls={gridId}
        aria-labelledby={label ? `${gridId}-label` : undefined}
      >
        {selectedGifs.length > 0 ? (
          <span className="gif-tray-items">
            {selectedGifs.map((gifUrl, index) => (
              <span key={index} className="gif-tray-item">
                <img src={gifUrl} alt={`Selected GIF ${index + 1}`} />
              </span>
            ))}
            {selectedGifs.length < maxSelection && (
              <span className="gif-tray-placeholder">
                {maxSelection - selectedGifs.length} more
              </span>
            )}
          </span>
        ) : (
          <span className="gif-tray-empty">Can pick {maxSelection}!</span>
        )}
        <span className={`gif-tray-arrow ${isExpanded ? "up" : "down"}`}>
          ▼
        </span>
      </button>

      {/* Grid */}
      {isExpanded && (
        <div className="gif-grid-container" id={gridId}>
          <div className="gif-grid-header">
            <span className="gif-grid-counter">
              {selectedGifs.length}/{maxSelection}
            </span>
            {selectedGifs.length > 0 && (
              <button
                type="button"
                className="gif-clear-button"
                onClick={handleClearAll}
              >
                Clear all
              </button>
            )}
          </div>
          <div className="gif-grid">
            {availableGifs.map((gifUrl, index) => {
              const isSelected = selectedGifs.includes(gifUrl);
              const isDisabled = !isSelected && !canSelectMore;
              return (
                <button
                  type="button"
                  key={index}
                  className={`gif-grid-item ${isSelected ? "selected" : ""} ${
                    isDisabled ? "disabled" : ""
                  }`}
                  onClick={() => handleGifToggle(gifUrl)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  aria-label={
                    isSelected
                      ? `Remove GIF ${index + 1}`
                      : isDisabled
                        ? `GIF ${index + 1} (maximum ${maxSelection} selected)`
                        : `Select GIF ${index + 1}`
                  }
                >
                  <img src={gifUrl} alt="" />
                  {isDisabled && <div className="gif-disabled-overlay" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GifSelector;
