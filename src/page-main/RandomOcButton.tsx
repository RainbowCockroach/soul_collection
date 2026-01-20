import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadOCs } from "../helpers/data-load";
import "./RandomOcButton.css";
import ButtonWrapper from "../common-components/ButtonWrapper";
import randomButton from "../assets/button_random.gif";
import buttonSoundHover from "/sound-effect/button_hover.mp3";
import buttonSound from "/sound-effect/button_oc_slot_aggressive.mp3";

interface RandomOcButtonProps {
  className?: string;
}

const RandomOcButton: React.FC<RandomOcButtonProps> = ({ className }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRandomOc = async () => {
    setIsLoading(true);
    try {
      const ocs = await loadOCs();
      if (ocs.length > 0) {
        const randomIndex = Math.floor(Math.random() * ocs.length);
        const randomOc = ocs[randomIndex];
        navigate(`/soul_collection/ocs/${randomOc.slug}`);
      }
    } catch (error) {
      console.error("Failed to load OCs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ButtonWrapper
      onClick={handleRandomOc}
      disabled={isLoading}
      className={className}
      hoverSoundFile={buttonSoundHover}
      soundFile={buttonSound}
    >
      {isLoading ? (
        "..."
      ) : (
        <div className="button-glow-wrapper">
          <img
            src={randomButton}
            alt="Random OC Button"
            className="shadow-3d button-image"
          />
        </div>
      )}
    </ButtonWrapper>
  );
};

export default RandomOcButton;
