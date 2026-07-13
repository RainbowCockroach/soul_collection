import { useState, useRef, useEffect, useId } from "react";
import useSound from "use-sound";
import buttonSound from "/sound-effect/button_gallery_item.mp3";
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
  const [playClick] = useSound(buttonSound, { volume: 0.5 });

  const toggleExpanded = () => {
    playClick();
    setIsExpanded((expanded) => !expanded);
  };

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

  const canSelectMore = selectedGifs.length < maxSelection;

  // Grid clicks add a copy. The same blinkie may be picked more than once, so
  // adding is one-directional (up to the max) — removal happens in the tray.
  const handleAdd = (gifUrl: string) => {
    if (canSelectMore) {
      playClick();
      onSelectionChange([...selectedGifs, gifUrl]);
    }
  };

  // Remove a single picked instance by its position in the tray, so removing
  // one copy of a duplicated blinkie leaves the others in place.
  const handleRemoveAt = (index: number) => {
    playClick();
    const newSelection = [...selectedGifs];
    newSelection.splice(index, 1);
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    playClick();
    onSelectionChange([]);
  };

  const countOf = (gifUrl: string) =>
    selectedGifs.reduce((total, gif) => (gif === gifUrl ? total + 1 : total), 0);

  const remaining = maxSelection - selectedGifs.length;

  return (
    <div className="gif-selector" ref={containerRef}>
      {label && (
        <span className="gif-selector-label" id={`${gridId}-label`}>
          {label}
        </span>
      )}

      {/* Tray: previews double as remove buttons; the arrow toggles the grid */}
      <div
        className={`gif-tray ${isExpanded ? "expanded" : "collapsed"}`}
        aria-labelledby={label ? `${gridId}-label` : undefined}
      >
        {selectedGifs.length > 0 ? (
          <span className="gif-tray-items">
            {selectedGifs.map((gifUrl, index) => (
              <button
                type="button"
                key={index}
                className="gif-tray-item"
                onClick={() => handleRemoveAt(index)}
                aria-label={`Remove blinkie ${index + 1}`}
              >
                <img src={gifUrl} alt="" />
                <span className="gif-remove-indicator" aria-hidden="true">
                  ×
                </span>
              </button>
            ))}
            {canSelectMore && (
              <button
                type="button"
                className="gif-tray-add"
                onClick={() => {
                  playClick();
                  setIsExpanded(true);
                }}
                aria-expanded={isExpanded}
                aria-controls={gridId}
                aria-label={`Add more blinkies (${remaining} left)`}
              >
                + {remaining} more
              </button>
            )}
          </span>
        ) : (
          <button
            type="button"
            className="gif-tray-empty-toggle"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-controls={gridId}
          >
            <span className="gif-tray-empty">Can pick {maxSelection}!</span>
          </button>
        )}
        <button
          type="button"
          ref={trayRef}
          className="gif-tray-arrow-button"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-controls={gridId}
          aria-label={isExpanded ? "Hide blinkie picker" : "Show blinkie picker"}
        >
          <span className={`gif-tray-arrow ${isExpanded ? "up" : "down"}`}>
            ▼
          </span>
        </button>
      </div>

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
              const count = countOf(gifUrl);
              const isDisabled = !canSelectMore;
              return (
                <button
                  type="button"
                  key={index}
                  className={`gif-grid-item ${count > 0 ? "selected" : ""} ${
                    isDisabled ? "disabled" : ""
                  }`}
                  onClick={() => handleAdd(gifUrl)}
                  disabled={isDisabled}
                  aria-label={
                    isDisabled
                      ? `Blinkie ${index + 1} (maximum ${maxSelection} picked)`
                      : count > 0
                        ? `Add another blinkie ${index + 1} (${count} picked)`
                        : `Add blinkie ${index + 1}`
                  }
                >
                  <img src={gifUrl} alt="" />
                  {count > 0 && (
                    <span className="gif-count-badge" aria-hidden="true">
                      ×{count}
                    </span>
                  )}
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
