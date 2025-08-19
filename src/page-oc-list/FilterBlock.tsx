import React from "react";
import type { Tag } from "../helpers/objects";
import "./FilterBlock.css";

interface FilterBlockProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagSlug: string) => void;
  onClearAll: () => void;
}

const FilterBlock: React.FC<FilterBlockProps> = ({
  tags,
  selectedTags,
  onTagToggle,
  onClearAll,
}) => {
  const handleTagClick = (tagSlug: string) => {
    onTagToggle(tagSlug);
  };

  return (
    <div className="filter-block">
      <div className="filter-header">
        {selectedTags.length > 0 && (
          <button className="clear-button" onClick={onClearAll}>
            Clear All ({selectedTags.length})
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
