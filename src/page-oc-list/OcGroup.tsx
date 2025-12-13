import React from "react";
import OcSlot from "./OcSlot";
import type { OC } from "./OcSlot";
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
}

const OcGroup: React.FC<OcGroupProps> = ({
  groupInfo,
  isExpanded,
  onToggle,
}) => {
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OcGroup;
