import React from "react";
import { useNavigate } from "react-router-dom";
import "./OcSlot.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";

export interface OC {
  slug: string;
  name: string;
  avatar: string;
}

interface OcSlotProps {
  oc: OC;
  frameColour: string;
  textColour: string;
}

const OcSlot: React.FC<OcSlotProps> = ({ oc, frameColour, textColour }) => {
  console.log(frameColour);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${oc.slug}`);
  };

  return (
    <div
      className="div-3d-with-shadow oc-slot"
      onClick={handleClick}
      style={{
        cursor: "pointer",
        backgroundColor: frameColour,
        border: `5px solid ${frameColour}`,
      }}
    >
      <img src={oc.avatar} alt={oc.name} className="oc-avatar" />
      <div className="oc-slot-name-box">
        <h3 className="oc-name" style={{ color: textColour }}>
          <BBCodeDisplay bbcode={oc.name} />
        </h3>
      </div>
    </div>
  );
};

export default OcSlot;
