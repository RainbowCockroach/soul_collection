import React, { useState, useEffect } from "react";
import OcGroup from "./OcGroup";
import type { OcGroupInfo } from "./OcGroup";
import FilterBlock from "./FilterBlock";
import { loadAllData } from "../helpers/data-load";
import type { OC, Group, Tag } from "../helpers/objects";
import "./OcGroup.css";
import "./FilterBlock.css";

interface ExpandedGroups {
  [groupId: string]: boolean;
}

// Helper function to format data into required structure
function formatDataForGroups(
  ocs: OC[],
  groups: Group[],
  selectedTags: string[]
): OcGroupInfo[] {
  return groups.map((group) => {
    let groupOCs = ocs.filter((oc) => oc.group.includes(group.slug));

    // Filter by selected tags if any are selected
    if (selectedTags.length > 0) {
      groupOCs = groupOCs.filter((oc) =>
        selectedTags.every((tagSlug) => oc.tags.includes(tagSlug))
      );
    }

    return {
      slug: group.slug,
      name: group.name,
      frameColour: group.frameColour,
      textColour: group.groupHeaderTextColour,
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
  const [allOcs, setAllOcs] = useState<OC[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState<boolean>(false);

  // Load data from helper function
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const { ocs, groups, tags } = await loadAllData();
        setAllOcs(ocs);
        setAllGroups(groups);
        setAllTags(tags);

        const formattedData = formatDataForGroups(ocs, groups, []);
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

  // Update filtered data when selected tags change
  useEffect(() => {
    if (allOcs.length > 0 && allGroups.length > 0) {
      const formattedData = formatDataForGroups(
        allOcs,
        allGroups,
        selectedTags
      );
      setGroupWithOcsData(formattedData);
    }
  }, [selectedTags, allOcs, allGroups]);

  const toggleGroup = (groupId: string): void => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleTagToggle = (tagSlug: string): void => {
    setSelectedTags((prev) => {
      if (prev.includes(tagSlug)) {
        return prev.filter((tag) => tag !== tagSlug);
      } else {
        return [...prev, tagSlug];
      }
    });
  };

  const handleClearAllTags = (): void => {
    setSelectedTags([]);
  };

  const toggleFilterVisibility = (): void => {
    setShowFilter((prev) => !prev);
  };

  if (isLoading) {
    return <div>Loading characters...</div>;
  }

  return (
    <div>
      <div className="filter-toggle-container">
        <button
          className="filter-toggle-button div-3d-with-shadow"
          onClick={toggleFilterVisibility}
        >
          {showFilter ? "Hide Filters" : "Show Filters"}
          {selectedTags.length > 0 && ` (${selectedTags.length} active)`}
        </button>
      </div>
      {showFilter && (
        <FilterBlock
          tags={allTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          onClearAll={handleClearAllTags}
        />
      )}
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
