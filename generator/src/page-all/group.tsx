import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import OcSlot from "./slot";
import type { OC } from "./slot";

export interface OcGroupInfo {
  id: string;
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
      <button onClick={() => onToggle(groupInfo.id)} className="group-header">
        <h2 className="group-name">{groupInfo.name}</h2>
        <div className="group-info">
          <span className="oc-count">{groupInfo.ocList.length} souls</span>
          {isExpanded ? (
            <ChevronDown className="chevron-icon" />
          ) : (
            <ChevronRight className="chevron-icon" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="oc-group-content">
          <div className="oc-group-grid">
            {groupInfo.ocList.map((oc, index) => (
              <OcSlot key={index} oc={oc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OcGroup;
