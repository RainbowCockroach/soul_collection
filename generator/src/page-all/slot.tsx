import React from "react";
import "./slot.css";

export interface OC {
  id: string;
  name: string;
  avatar: string;
}

interface OcSlotProps {
  oc: OC;
}

const OcSlot: React.FC<OcSlotProps> = ({ oc }) => (
  <div className="oc-slot">
    <img src={oc.avatar} alt={oc.name} className="oc-avatar" />
    <h3 className="oc-name">{oc.name}</h3>
  </div>
);

export default OcSlot;
