import React from "react";
import OcSlot from "./OcSlot";
import type { OC } from "./OcSlot";
import type { Ship } from "../helpers/objects";
import ButtonWrapper from "../common-components/ButtonWrapper";
import DropdownArrow from "../common-components/DropdownArrow";
import "./OcGroup.css";

export interface OcGroupInfo {
  slug: string;
  name: string;
  frameColour: string;
  textColour: string;
  groupHeaderColour: string;
  groupHeaderTextColour: string;
  ocList: OC[];
}

interface OcGroupProps {
  groupInfo: OcGroupInfo;
  isExpanded: boolean;
  onToggle: (categoryId: string) => void;
  ships: Ship[];
  selectedShips: string[];
}

const OcGroup: React.FC<OcGroupProps> = ({
  groupInfo,
  isExpanded,
  onToggle,
  ships,
  selectedShips,
}) => {
  // Helper function to get ship icon for an OC
  const getShipIconForOc = (ocSlug: string): string | undefined => {
    // If ships are selected, show only selected ship icons
    if (selectedShips.length > 0) {
      // Find the first selected ship that includes this OC
      for (const shipName of selectedShips) {
        const ship = ships.find(
          (s) => s.name === shipName && s.oc.includes(ocSlug)
        );
        if (ship) {
          return ship.displayIcon;
        }
      }
      return undefined;
    }

    // Otherwise, show the first ship this OC is part of
    const shipForOc = ships.find((s) => s.oc.includes(ocSlug));
    return shipForOc?.displayIcon;
  };

  return (
    <div className="oc-group">
      <ButtonWrapper
        onClick={() => onToggle(groupInfo.slug)}
        className="div-3d-with-shadow group-header"
        style={{ background: groupInfo.groupHeaderColour }}
      >
        <DropdownArrow
          fill={groupInfo.groupHeaderTextColour}
          style={{
            transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s ease",
          }}
        />
        <h2 style={{ color: groupInfo.groupHeaderTextColour }}>
          {groupInfo.name}
        </h2>
      </ButtonWrapper>

      {isExpanded && (
        <div className="oc-group-content">
          <div className="oc-group-grid">
            {groupInfo.ocList.map((oc) => (
              <OcSlot
                key={oc.slug}
                oc={oc}
                frameColour={groupInfo.frameColour}
                textColour={groupInfo.groupHeaderTextColour}
                shipIcon={getShipIconForOc(oc.slug)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OcGroup;
