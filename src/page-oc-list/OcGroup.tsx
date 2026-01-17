import React from "react";
import OcSlot from "./OcSlot";
import type { OC } from "./OcSlot";
import type { Ship } from "../helpers/objects";
import ButtonWrapper from "../common-components/ButtonWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
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
  // Helper function to get ship colors for an OC
  const getShipColorsForOc = (ocSlug: string): string[] => {
    // If ships are selected, show only selected ship colors
    if (selectedShips.length > 0) {
      // Find all selected ships that include this OC
      return selectedShips
        .map((shipName) => {
          const ship = ships.find(
            (s) => s.name === shipName && s.oc.includes(ocSlug)
          );
          return ship ? ship.color : null;
        })
        .filter((color): color is string => color !== null);
    }

    // Otherwise, show all ships this OC is part of
    return ships.filter((s) => s.oc.includes(ocSlug)).map((s) => s.color);
  };

  // Helper function to get ship texts for an OC
  const getShipTextsForOc = (ocSlug: string): string[] => {
    // If ships are selected, show only selected ship texts
    if (selectedShips.length > 0) {
      // Find all selected ships that include this OC
      return selectedShips
        .map((shipName) => {
          const ship = ships.find(
            (s) => s.name === shipName && s.oc.includes(ocSlug)
          );
          return ship ? ship.shipText?.[ocSlug] : null;
        })
        .filter((text): text is string => text !== null);
    }

    // Otherwise, show all ships this OC is part of
    return ships
      .filter((s) => s.oc.includes(ocSlug))
      .map((s) => s.shipText?.[ocSlug])
      .filter((text): text is string => text !== undefined);
  };

  return (
    <div className="oc-group">
      <ButtonWrapper
        onClick={() => onToggle(groupInfo.slug)}
        className="div-3d-with-shadow group-header"
        style={{ background: groupInfo.groupHeaderColour }}
      >
        <h2
          className="text-outline-thick"
          style={{ color: groupInfo.groupHeaderTextColour }}
        >
          <FontAwesomeIcon
            icon={faCaretDown}
            style={{
              color: groupInfo.groupHeaderTextColour,
              transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s ease",
            }}
          />
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
                shipColors={getShipColorsForOc(oc.slug)}
                shipTexts={getShipTextsForOc(oc.slug)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OcGroup;
