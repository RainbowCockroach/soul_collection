import React, { type ReactNode, useState } from "react";
import useSound from "use-sound";
import buttonSound from "/sound-effect/button.mp3";
import "./ButtonWrapper.css";

interface ButtonWrapperProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const ButtonWrapper: React.FC<ButtonWrapperProps> = ({
  children,
  onClick,
  disabled = false,
  className = "",
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [playSound] = useSound(buttonSound, { volume: 0.5 });

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (!disabled) {
      playSound();
      onClick();
    }
  };

  return (
    <button
      className={`button-wrapper ${className} ${isPressed ? "pressed" : ""} ${
        disabled ? "disabled" : ""
      }`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ButtonWrapper;
