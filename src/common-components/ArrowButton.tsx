import React from "react";
import arrowButton from "../assets/next_button_arrow.gif";
import ButtonWrapper from "./ButtonWrapper";
import buttonSound from "/sound-effect/button_gallery_item.mp3";
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
    <ButtonWrapper
      className={`arrow-button arrow-button--${direction} ${className}`}
      onClick={onClick}
      soundFile={buttonSound}
    >
      <img
        src={arrowButton}
        alt={direction === "left" ? "Left" : "Right"}
        style={{
          transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
        }}
      />
    </ButtonWrapper>
  );
};

export default ArrowButton;
