import React, { useState, useEffect } from "react";
import OcGroup from "./OcGroup";
import type { OcGroupInfo } from "./OcGroup";
import { loadAllData } from "../helpers/data-load";
import type { OC, Group } from "../helpers/objects";
import "./OcGroup.css";

interface ExpandedGroups {
  [groupId: string]: boolean;
}

// Helper function to format data into required structure
function formatDataForGroups(ocs: OC[], groups: Group[]): OcGroupInfo[] {
  return groups.map((group) => {
    const groupOCs = ocs.filter((oc) => oc.group.includes(group.slug));
    return {
      slug: group.slug,
      name: group.name,
      frameColour: group.frameColour,
      groupHeaderColour: group.groupHeaderColour,
      groupHeaderTextColour: group.groupHeaderTextColour,
      ocList: groupOCs.map((oc) => ({
        slug: oc.slug,
        name: oc.name,
        avatar: oc.avatar,
      })),
    };
  });
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
        const { ocs, groups } = await loadAllData();
        const formattedData = formatDataForGroups(ocs, groups);
        console.log(formattedData);
        setGroupWithOcsData(formattedData);

        // Initialize all groups as expanded
        const initialState: ExpandedGroups = {};
        formattedData.forEach((group) => {
          initialState[group.slug] = true;
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
            key={groupInfo.slug}
            groupInfo={groupInfo}
            isExpanded={expandedGroups[groupInfo.slug]}
            onToggle={toggleGroup}
          />
        ))}
      </div>
    </div>
  );
};

export default PageOcList;
