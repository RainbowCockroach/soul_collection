import React from "react";
import OcSlot from "./OcSlot";
import type { OC } from "./OcSlot";
import ButtonWrapper from "../common-components/ButtonWrapper";
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
        <svg
          width="1.5em"
          height="1.5em"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            display: "inline-block",
            marginRight: "0.5rem",
            transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s ease",
            fill: groupInfo.groupHeaderTextColour,
          }}
        >
          <path d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z" />
        </svg>
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
