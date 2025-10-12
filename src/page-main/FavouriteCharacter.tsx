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
}

const FavouriteCharacter: React.FC<FavouriteCharacterProps> = ({
  slug,
  name,
  avatar,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/soul_collection/ocs/${slug}`);
  };

  return (
    <ButtonWrapper
      onClick={handleClick}
      hoverSoundFile={buttonSoundHover}
      soundFile={buttonSoundOcSlot}
    >
      <div className="favourite-character">
        <img src={avatar} alt={name} className="favourite-avatar" />
        <h3 className="favourite-name">{name}</h3>
      </div>
    </ButtonWrapper>
  );
};

export default FavouriteCharacter;
