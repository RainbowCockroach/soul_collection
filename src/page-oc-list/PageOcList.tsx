import React, { useState, useEffect } from "react";
import OcGroup from "./OcGroup";
import type { OcGroupInfo } from "./OcGroup";
import "./OcGroup.css";

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
        const data = [
          {
            slug: "1",
            name: "Group 1",
            ocList: [
              {
                slug: "1",
                name: "OC 1",
                avatar: "https://placehold.co/200",
              },
              {
                slug: "2",
                name: "OC 2",
                avatar: "https://placehold.co/200",
              },
            ],
          },
          {
            slug: "2",
            name: "Group 2",
            ocList: [
              {
                slug: "3",
                name: "OC 3",
                avatar: "https://placehold.co/200",
              },
            ],
          },
        ];
        console.log(data);
        setGroupWithOcsData(data);

        // Initialize all groups as expanded
        const initialState: ExpandedGroups = {};
        data.forEach((group) => {
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
