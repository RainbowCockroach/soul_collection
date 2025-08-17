import React, { useState, useCallback } from "react";
import "./SamStandee.css";

const SamStandee: React.FC = () => {
  const [currentGif, setCurrentGif] = useState<"still" | "poke" | "poked">(
    "still"
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentGif("poke");

    setTimeout(() => {
      setCurrentGif("poked");
      setIsAnimating(false);
    }, 4300);
  }, [isAnimating]);

  const getGifSrc = () => {
    switch (currentGif) {
      case "still":
        return "/soul_collection/src/assets/sam_still.gif";
      case "poke":
        return "/soul_collection/src/assets/sam_poke.gif";
      case "poked":
        return "/soul_collection/src/assets/sam_poked.gif";
      default:
        return "/soul_collection/src/assets/sam_still.gif";
    }
  };

  return (
    <div className="sam-standee">
      <img
        src={getGifSrc()}
        alt="Sam Standee"
        className={`sam-gif ${isAnimating ? "animating" : ""}`}
        onClick={handleClick}
      />
    </div>
  );
};

export default SamStandee;
