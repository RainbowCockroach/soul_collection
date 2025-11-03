import React, { type ReactNode, useState } from "react";
import useSound from "use-sound";
import "./ButtonWrapper.css";

interface ButtonWrapperProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  soundFile?: string;
  soundVolume?: number;
  hoverSoundFile?: string;
  hoverSoundVolume?: number;
}

const ButtonWrapper: React.FC<ButtonWrapperProps> = ({
  children,
  onClick,
  disabled = false,
  className = "",
  style,
  soundFile,
  soundVolume = 0.5,
  hoverSoundFile,
  hoverSoundVolume = 0.5,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [playSound] = useSound(soundFile || "", { volume: soundVolume });
  const [playHoverSound] = useSound(hoverSoundFile || "", {
    volume: hoverSoundVolume,
  });

  const handleMouseEnter = () => {
    if (!disabled && hoverSoundFile) {
      playHoverSound();
    }
  };

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
      if (soundFile) {
        playSound();
      }
      onClick();
    }
  };

  return (
    <button
      className={`button-wrapper ${className} ${isPressed ? "pressed" : ""} ${
        disabled ? "disabled" : ""
      }`}
      style={style}
      onMouseEnter={handleMouseEnter}
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
