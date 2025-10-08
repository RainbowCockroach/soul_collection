import React from "react";
import { useNavigate } from "react-router-dom";
import ButtonWrapper from "../common-components/ButtonWrapper";
import "./FavouriteCharacter.css";

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
    navigate(`/ocs/${slug}`);
  };

  return (
    <ButtonWrapper onClick={handleClick}>
      <div className="favourite-character">
        <img src={avatar} alt={name} className="favourite-avatar" />
        <p className="favourite-name">{name}</p>
      </div>
    </ButtonWrapper>
  );
};

export default FavouriteCharacter;
