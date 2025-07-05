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
}

const OcSlot: React.FC<OcSlotProps> = ({ oc }) => {
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
      <img src={oc.avatar} alt={oc.name} className="oc-avatar" />
      <h3 className="oc-name">{oc.name}</h3>
    </div>
  );
};

export default OcSlot;
