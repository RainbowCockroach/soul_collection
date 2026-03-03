import React from "react";
import { useNavigate } from "react-router-dom";
import ButtonWrapper from "../common-components/ButtonWrapper";
import "./FavouriteCharacter.css";
import buttonSoundHover from "/sound-effect/button_hover.mp3";
import buttonSoundOcSlot from "/sound-effect/button_oc_slot.mp3";

interface FavouriteCharacterProps {
  slug: string;
  name: string;
  avatar: string;
  disabled?: boolean;
}

const FavouriteCharacter: React.FC<FavouriteCharacterProps> = ({
  slug,
  name,
  avatar,
  disabled,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    navigate(`/soul_collection/ocs/${slug}`);
  };

  return (
    <ButtonWrapper
      onClick={handleClick}
      hoverSoundFile={disabled ? undefined : buttonSoundHover}
      soundFile={disabled ? undefined : buttonSoundOcSlot}
      disabled={disabled}
    >
      <div
        className="favourite-character"
        style={
          disabled
            ? { filter: "grayscale(100%)", opacity: 0.4, cursor: "not-allowed" }
            : undefined
        }
      >
        <img src={avatar} alt={name} className="favourite-avatar" />
        <h3 className="favourite-name">{name}</h3>
      </div>
    </ButtonWrapper>
  );
};

export default FavouriteCharacter;
