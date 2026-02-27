import React, { useState, useMemo } from "react";
import { activateSenseBreak } from "./sense-break";
import "./SenseBreakButton.css";

interface SenseBreakButtonProps {
  chance?: number;
}

const SenseBreakButton: React.FC<SenseBreakButtonProps> = ({
  chance = 0.1,
}) => {
  const shouldShow = useMemo(() => Math.random() < chance, []);
  const [visible, setVisible] = useState(true);

  if (!shouldShow || !visible) return null;

  const handleClick = () => {
    activateSenseBreak();
    setVisible(false);
  };

  return (
    <button
      className="sense-break-button"
      onClick={handleClick}
      aria-label="???"
      title=""
    >
      <svg
        width="42"
        height="42"
        viewBox="0 0 42 42"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="21" cy="21" r="21" fill="#ff0000" />
      </svg>
    </button>
  );
};

export default SenseBreakButton;
