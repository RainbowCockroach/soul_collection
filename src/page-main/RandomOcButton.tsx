import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadOCs } from "../helpers/data-load";
import "./RandomOcButton.css";

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
    <button
      className={`random-oc-button ${className || ""}`}
      onClick={handleRandomOc}
      disabled={isLoading}
    >
      {isLoading ? "..." : "Random OC"}
    </button>
  );
};

export default RandomOcButton;
