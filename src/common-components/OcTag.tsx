import React from "react";
import type { Tag } from "../helpers/objects";
import "./OcTag.css";

interface OcTagBaseProps {
  tag: Tag;
}

interface OcTagDisplayProps extends OcTagBaseProps {
  onClick?: undefined;
  isSelected?: undefined;
}

interface OcTagFilterProps extends OcTagBaseProps {
  onClick: (tagSlug: string) => void;
  isSelected: boolean;
}

type OcTagProps = OcTagDisplayProps | OcTagFilterProps;

const OcTag: React.FC<OcTagProps> = ({ tag, onClick, isSelected }) => {
  if (onClick !== undefined) {
    return (
      <button
        className={`oc-detail-tag tag-button effect-subtle-rise${isSelected ? " selected" : ""}`}
        style={{
          backgroundColor: tag.backgroundColour,
          color: tag.textColour,
          opacity: isSelected ? 1 : 0.6,
        }}
        onClick={() => onClick(tag.slug)}
        title={`Click to ${isSelected ? "remove" : "add"} filter`}
      >
        {tag.name}
      </button>
    );
  }

  return (
    <span
      className="oc-detail-tag"
      style={{
        backgroundColor: tag.backgroundColour,
        color: tag.textColour,
      }}
    >
      {tag.name}
    </span>
  );
};

export default OcTag;
