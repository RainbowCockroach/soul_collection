import React, { useState, useCallback } from "react";
import "./SamStandee.css";
import samStill from "../assets/sam_standee_still.gif";
import samPoke from "../assets/sam_standee_poke.gif";
import samPoked from "../assets/sam_standee_poked.gif";

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
        onClick={handleClick}
      />
    </div>
  );
};

export default SamStandee;
