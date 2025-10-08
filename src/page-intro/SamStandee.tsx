import React, { useState, useCallback, useEffect } from "react";
import "./SamStandee.css";
import samStill from "../assets/sam_standee_still.gif";
import samPoke from "../assets/sam_standee_poke.gif";
import samPoked from "../assets/sam_standee_poked.gif";

interface SamStandeeProps {
  onAnimationChange?: () => void;
  onTextChange?: () => void;
  autoTrigger?: boolean;
}

const SamStandee: React.FC<SamStandeeProps> = ({
  onAnimationChange,
  onTextChange,
  autoTrigger = false,
}) => {
  const [currentGif, setCurrentGif] = useState<"still" | "poke" | "poked">(
    "still"
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnimationChange = useCallback(() => {
    if (isAnimating || currentGif === "poked") return;

    setIsAnimating(true);
    setCurrentGif("poke");

    onAnimationChange?.();

    setTimeout(() => {
      setCurrentGif("poked");
      setIsAnimating(false);
    }, 4300);
  }, [isAnimating, currentGif, onAnimationChange]);

  const handleTextChange = useCallback(() => {
    onTextChange?.();
  }, [onTextChange]);

  // Auto-trigger animation when autoTrigger prop is true
  useEffect(() => {
    if (autoTrigger && currentGif === "still" && !isAnimating) {
      handleAnimationChange();
    }
  }, [autoTrigger, currentGif, isAnimating, handleAnimationChange]);

  const getGifSrc = () => {
    switch (currentGif) {
      case "still":
        return samStill;
      case "poke":
        return samPoke;
      case "poked":
        return samPoked;
      default:
        return samStill;
    }
  };

  return (
    <div className="sam-standee">
      <img
        src={getGifSrc()}
        alt="Sam Standee"
        className={`sam-gif ${isAnimating ? "animating" : ""}`}
        onClick={() => {
          if (currentGif != "still") {
            handleTextChange();
          } else {
            handleAnimationChange();
          }
        }}
      />
    </div>
  );
};

export default SamStandee;
