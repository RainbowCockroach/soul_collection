import React from "react";
import { useNavigate } from "react-router-dom";
import "./OcSlot.css";

export interface OC {
  slug: string;
  name: string;
  avatar: string;
}

interface OcSlotProps {
  oc: OC;
  frameColour: string;
}

const OcSlot: React.FC<OcSlotProps> = ({ oc, frameColour }) => {
  console.log(frameColour);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${oc.slug}`);
  };

  return (
    <div
      className="oc-slot"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <img
        src={oc.avatar}
        alt={oc.name}
        className="oc-avatar div-3d-with-shadow"
        style={{
          border: `5px solid ${frameColour}`,
        }}
      />
      <h3 className="oc-name" style={{ color: frameColour }}>
        {oc.name}
      </h3>
    </div>
  );
};

export default OcSlot;
