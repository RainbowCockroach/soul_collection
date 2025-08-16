import React from "react";
import { Link } from "react-router-dom";
import "./SwitchFormButton.css";

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
              src="https://adriansblinkiecollection.neocities.org/buttons/f19.gif"
              alt={isGodForm ? "God Form" : "Birth Form"}
              className="switch-form-icon"
            />
          </div>
        ) : (
          <div>
            <img
              src="https://adriansblinkiecollection.neocities.org/buttons/f19.gif"
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
