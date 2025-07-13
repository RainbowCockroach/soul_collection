import React from "react";
import OcSlot from "./OcSlot";
import type { OC } from "./OcSlot";
import "./OcGroup.css";

export interface OcGroupInfo {
  slug: string;
  name: string;
  frameColour: string;
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
      <button
        onClick={() => onToggle(groupInfo.slug)}
        className="div-3d-with-shadow group-header"
        style={{ background: groupInfo.groupHeaderColour }}
      >
        <h2 style={{ color: groupInfo.groupHeaderTextColour }}>
          {groupInfo.name}
        </h2>
      </button>

      {isExpanded && (
        <div className="oc-group-content">
          <div className="oc-group-grid">
            {groupInfo.ocList.map((oc) => (
              <OcSlot
                key={oc.slug}
                oc={oc}
                frameColour={groupInfo.frameColour}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OcGroup;
