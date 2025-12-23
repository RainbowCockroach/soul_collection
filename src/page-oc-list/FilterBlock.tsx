import React from "react";
import type { Tag, Ship } from "../helpers/objects";
import "./FilterBlock.css";

interface FilterBlockProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagSlug: string) => void;
  onClearAll: () => void;
  ships: Ship[];
  selectedShips: string[];
  onShipToggle: (shipName: string) => void;
  onClearAllShips: () => void;
}

const FilterBlock: React.FC<FilterBlockProps> = ({
  tags,
  selectedTags,
  onTagToggle,
  onClearAll,
  ships,
  selectedShips,
  onShipToggle,
  onClearAllShips,
}) => {
  const handleTagClick = (tagSlug: string) => {
    onTagToggle(tagSlug);
  };

  const handleShipClick = (shipName: string) => {
    onShipToggle(shipName);
  };

  return (
    <div className="filter-block">
      {/* Ships Section */}
      {ships.length > 0 && (
        <>
          <div className="filter-header">
            <h3>Ships</h3>
            {selectedShips.length > 0 && (
              <button className="clear-button" onClick={onClearAllShips}>
                Clear All Ships ({selectedShips.length})
              </button>
            )}
          </div>
          <div className="tag-list">
            {ships.map((ship) => {
              const isSelected = selectedShips.includes(ship.name);
              return (
                <button
                  key={ship.name}
                  className={`oc-detail-tag div-3d-with-shadow tag-button ${
                    isSelected ? "selected" : ""
                  }`}
                  style={{
                    backgroundColor: ship.color,
                    color: "#000",
                    opacity: isSelected ? 1 : 0.6,
                  }}
                  onClick={() => handleShipClick(ship.name)}
                  title={`Click to ${isSelected ? "remove" : "add"} filter`}
                >
                  {ship.name}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Tags Section */}
      <div className="filter-header">
        <h3>Tags</h3>
        {selectedTags.length > 0 && (
          <button className="clear-button" onClick={onClearAll}>
            Clear All Tags ({selectedTags.length})
          </button>
        )}
      </div>
      <div className="tag-list">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.slug);
          return (
            <button
              key={tag.slug}
              className={`oc-detail-tag div-3d-with-shadow tag-button ${
                isSelected ? "selected" : ""
              }`}
              style={{
                backgroundColor: tag.backgroundColour,
                color: tag.textColour,
                opacity: isSelected ? 1 : 0.6,
              }}
              onClick={() => handleTagClick(tag.slug)}
              title={`Click to ${isSelected ? "remove" : "add"} filter`}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterBlock;
