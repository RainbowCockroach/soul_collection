import React from "react";
import { Link } from "react-router-dom";
import "./SwitchFormButton.css";
import godForm from "../assets/switch_button_god_form.gif";
import birthForm from "../assets/switch_button_birth_form.gif";

interface SwitchFormButtonProps {
  linkedOcSlug: string;
  linkedOcName: string;
  isGodForm: boolean;
}

const SwitchFormButton: React.FC<SwitchFormButtonProps> = ({
  linkedOcSlug,
  isGodForm,
}) => {
  return (
    <div className="switch-form-container">
      <Link
        to={`/soul_collection/ocs/${linkedOcSlug}`}
        className="switch-form-button div-3d-with-shadow"
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
      </Link>
    </div>
  );
};

export default SwitchFormButton;
