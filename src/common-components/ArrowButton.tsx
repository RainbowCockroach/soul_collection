import React from "react";
import arrowButton from "../assets/next_button_arrow.gif";
import "./ArrowButton.css";

interface ArrowButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  className?: string;
}

const ArrowButton: React.FC<ArrowButtonProps> = ({
  direction,
  onClick,
  className = "",
}) => {
  return (
    <button
      className={`arrow-button arrow-button--${direction} ${className}`}
      onClick={onClick}
    >
      <img
        src={arrowButton}
        alt={direction === "left" ? "Left" : "Right"}
        style={{
          transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
        }}
      />
    </button>
  );
};

export default ArrowButton;