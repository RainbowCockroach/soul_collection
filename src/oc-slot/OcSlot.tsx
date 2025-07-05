import React from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../misc/constants";

export interface OcSlotProps {
  slug: string;
  name: string;
  avatar: string;
}

const OcSlot: React.FC<OcSlotProps> = (oc: OcSlotProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${baseUrl}/oc/${oc.slug}`);
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
