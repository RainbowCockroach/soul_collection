import React from "react";
import OcSlot from "./OcSlot";
import type { OC } from "./OcSlot";

export interface OcGroupInfo {
  slug: string;
  name: string;
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
      <button onClick={() => onToggle(groupInfo.slug)} className="group-header">
        <h2 className="group-name">{groupInfo.name}</h2>
        <div className="group-info">
          <span className="oc-count">{groupInfo.ocList.length}</span>
          {isExpanded ? <span>👁</span> : <span>—</span>}
        </div>
      </button>

      {isExpanded && (
        <div className="oc-group-content">
          <div className="oc-group-grid">
            {groupInfo.ocList.map((oc) => (
              <OcSlot key={oc.slug} oc={oc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OcGroup;
