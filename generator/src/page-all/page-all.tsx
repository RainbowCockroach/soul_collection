import React, { useState, useEffect } from "react";
import "./page-all.css";
import OcGroup from "./group";
import type { OcGroupInfo } from "./group";
import { loadAndGroupOcData } from "./helper";

interface ExpandedGroups {
  [groupId: string]: boolean;
}

const PageOcList: React.FC = () => {
  const [expandedGroups, setExpandedGroups] = useState<ExpandedGroups>({});
  const [groupWithOcsData, setGroupWithOcsData] = useState<OcGroupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from helper function
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await loadAndGroupOcData();
        console.log(data);
        setGroupWithOcsData(data);

        // Initialize all groups as expanded
        const initialState: ExpandedGroups = {};
        data.forEach((group) => {
          initialState[group.id] = true;
        });
        setExpandedGroups(initialState);
      } catch (error) {
        console.error("Error loading OC data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleGroup = (groupId: string): void => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  if (isLoading) {
    return <div>Loading characters...</div>;
  }

  return (
    <div>
      <div>
        {groupWithOcsData.map((groupInfo) => (
          <OcGroup
            key={groupInfo.id}
            groupInfo={groupInfo}
            isExpanded={expandedGroups[groupInfo.id]}
            onToggle={toggleGroup}
          />
        ))}
      </div>
    </div>
  );
};

export default PageOcList;
