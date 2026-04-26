import React from "react";
import { useNavigate } from "react-router-dom";
import "./OcSlot.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";
import Marquee from "react-fast-marquee";
import ButtonWrapper from "../common-components/ButtonWrapper";
import AvatarSlideshow from "../common-components/AvatarSlideshow";
import Tooltip from "../common-components/Tooltip";
import ShipHeartIcon from "../common-components/ShipHeartIcon";
import buttonSoundOcSlot from "/sound-effect/button_oc_slot.mp3";
import buttonSoundHover from "/sound-effect/button_hover.mp3";

export interface OC {
  slug: string;
  name: string;
  avatar: string[];
}

interface OcSlotProps {
  oc: OC;
  frameColour: string;
  textColour: string;
  shipColors?: string[]; // Array of hex color codes for ship heart icons
  shipTexts?: string[]; // Array of ship texts to display in tooltips
  disabled?: boolean;
}

const OcSlot: React.FC<OcSlotProps> = ({
  oc,
  frameColour,
  textColour,
  shipColors,
  shipTexts,
  disabled,
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (disabled) return;
    navigate(`/soul_collection/ocs/${oc.slug}`);
  };

  return (
    <ButtonWrapper
      onClick={handleClick}
      soundFile={disabled ? undefined : buttonSoundOcSlot}
      hoverSoundFile={disabled ? undefined : buttonSoundHover}
      disabled={disabled}
    >
      <div
        className="oc-slot-wrapper"
        style={
          disabled
            ? { filter: "grayscale(100%)", opacity: 0.4, cursor: "not-allowed" }
            : undefined
        }
      >
        {/* Ship heart icons positioned above the frame */}
        {shipColors && shipColors.length > 0 && (
          <div className="oc-slot-ship-icons">
            {shipColors.map((color, index) => (
              <div key={index} className="oc-slot-ship-icon">
                <Tooltip content={shipTexts?.[index] || ""} position="top">
                  <ShipHeartIcon color={color} />
                </Tooltip>
              </div>
            ))}
          </div>
        )}

        <div
          className="div-3d-no-shadow oc-slot"
          style={{
            backgroundColor: frameColour,
            border: `5px solid ${frameColour}`,
          }}
        >
          <AvatarSlideshow
            images={oc.avatar}
            alt={oc.name}
            className="oc-avatar"
          />
          <div className="oc-slot-name-box">
            <h3 className="oc-name" style={{ color: textColour }}>
              <Marquee pauseOnHover={true} play={true}>
                <BBCodeDisplay bbcode={oc.name} />
              </Marquee>
            </h3>
          </div>
        </div>
      </div>
    </ButtonWrapper>
  );
};

export default OcSlot;
