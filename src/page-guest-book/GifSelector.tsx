import { useState, useRef, useEffect } from "react";
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

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const handleTrayClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleGifRemove = (index: number) => {
    if (isExpanded) {
      const newSelection = [...selectedGifs];
      newSelection.splice(index, 1);
      onSelectionChange(newSelection);
    }
  };

  const handleGifSelect = (gifUrl: string) => {
    if (selectedGifs.length < maxSelection) {
      onSelectionChange([...selectedGifs, gifUrl]);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const canSelectMore = selectedGifs.length < maxSelection;

  return (
    <div className="gif-selector" ref={containerRef}>
      {label && <label className="gif-selector-label">{label}</label>}

      {/* Tray */}
      <div
        className={`gif-tray ${isExpanded ? "expanded" : "collapsed"}`}
        onClick={handleTrayClick}
      >
        {selectedGifs.length > 0 ? (
          <div className="gif-tray-items">
            {selectedGifs.map((gifUrl, index) => (
              <div
                key={index}
                className="gif-tray-item"
                onClick={(e) => {
                  if (isExpanded) {
                    e.stopPropagation();
                    handleGifRemove(index);
                  }
                }}
                title={isExpanded ? "Click to remove" : "Click tray to expand"}
              >
                <img src={gifUrl} alt={`Selected GIF ${index + 1}`} />
                {isExpanded && <span className="gif-remove-indicator">×</span>}
              </div>
            ))}
            {selectedGifs.length < maxSelection && (
              <div className="gif-tray-placeholder">
                {maxSelection - selectedGifs.length} more
              </div>
            )}
          </div>
        ) : (
          <span className="gif-tray-empty">Can pick {maxSelection}!</span>
        )}
        <span className={`gif-tray-arrow ${isExpanded ? "up" : "down"}`}>
          ▼
        </span>
      </div>

      {/* Grid */}
      {isExpanded && (
        <div className="gif-grid-container">
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
            {availableGifs.map((gifUrl, index) => (
              <div
                key={index}
                className={`gif-grid-item ${!canSelectMore ? "disabled" : ""}`}
                onClick={() => handleGifSelect(gifUrl)}
                title={
                  canSelectMore
                    ? "Click to select"
                    : `Maximum ${maxSelection} GIFs selected`
                }
              >
                <img src={gifUrl} alt={`GIF ${index + 1}`} />
                {!canSelectMore && <div className="gif-disabled-overlay" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GifSelector;
