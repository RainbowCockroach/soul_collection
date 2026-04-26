import React from "react";
import "./OcGroupCover.css";

export interface OcGroupCoverInfo {
  slug: string;
  name: string;
  frameColour: string;
  groupHeaderColour: string;
  groupHeaderTextColour: string;
  headerImage: string;
}

interface OcGroupCoverProps {
  groupInfo: OcGroupCoverInfo;
}

const OcGroupCover: React.FC<OcGroupCoverProps> = ({ groupInfo }) => {
  return (
    <div
      className="oc-group-cover"
      style={{ borderColor: groupInfo.frameColour }}
    >
      <div className="oc-group-cover-image-wrapper">
        <img
          src={groupInfo.headerImage}
          alt={groupInfo.name}
          className="oc-group-cover-image"
        />
      </div>
    </div>
  );
};

export default OcGroupCover;
