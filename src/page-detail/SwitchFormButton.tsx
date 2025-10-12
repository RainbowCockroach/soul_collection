import React from "react";
import { useNavigate } from "react-router-dom";
import ButtonWrapper from "../common-components/ButtonWrapper";
import "./SwitchFormButton.css";
import godForm from "../assets/switch_button_god_form.gif";
import birthForm from "../assets/switch_button_birth_form.gif";
import soundFileToGod from "/sound-effect/switch_form_birth_to_god.mp3";
import soundFileToBirth from "/sound-effect/switch_form_god_to_birth.mp3";
import soundFileHover from "/sound-effect/button_hover.mp3";

interface SwitchFormButtonProps {
  linkedOcSlug: string;
  linkedOcName: string;
  isGodForm: boolean;
}

const SwitchFormButton: React.FC<SwitchFormButtonProps> = ({
  linkedOcSlug,
  isGodForm,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/soul_collection/ocs/${linkedOcSlug}`);
  };

  return (
    <div className="switch-form-container">
      <ButtonWrapper
        onClick={handleClick}
        className="switch-form-button div-3d-with-shadow"
        soundFile={isGodForm ? soundFileToBirth : soundFileToGod}
        hoverSoundFile={soundFileHover}
      >
        {isGodForm ? (
          <div>
            <img
              src={godForm}
              alt={isGodForm ? "God Form" : "Birth Form"}
              className="switch-form-icon"
            />
          </div>
        ) : (
          <div>
            <img
              src={birthForm}
              alt={isGodForm ? "God Form" : "Birth Form"}
              className="switch-form-icon"
            />
          </div>
        )}
      </ButtonWrapper>
    </div>
  );
};

export default SwitchFormButton;
