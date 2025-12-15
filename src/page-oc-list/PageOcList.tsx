import React, { useState, useEffect } from "react";
import OcGroup from "./OcGroup";
import type { OcGroupInfo } from "./OcGroup";
import FilterBlock from "./FilterBlock";
import { loadAllData } from "../helpers/data-load";
import type { OC, Group, Tag, Ship } from "../helpers/objects";
import ButtonWrapper from "../common-components/ButtonWrapper";
import buttonSound from "/sound-effect/button_gallery_item.mp3";
import "./OcGroup.css";
import "./FilterBlock.css";

interface ExpandedGroups {
  [groupId: string]: boolean;
}

// Helper function to format data into required structure
function formatDataForGroups(
  ocs: OC[],
  groups: Group[],
  selectedTags: string[],
  selectedShips: string[],
  ships: Ship[]
): OcGroupInfo[] {
  return groups.map((group) => {
    let groupOCs = ocs.filter((oc) => oc.group.includes(group.slug));

    // Filter by selected tags if any are selected
    if (selectedTags.length > 0) {
      groupOCs = groupOCs.filter((oc) =>
        selectedTags.every((tagSlug) => oc.tags.includes(tagSlug))
      );
    }

    // Filter by selected ships if any are selected
    if (selectedShips.length > 0) {
      groupOCs = groupOCs.filter((oc) =>
        selectedShips.some((shipName) => {
          // Find the ship with this name
          const ship = ships.find((s) => s.name === shipName);
          // Check if this OC is in the ship
          return ship ? ship.oc.includes(oc.slug) : false;
        })
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
  const [allShips, setAllShips] = useState<Ship[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedShips, setSelectedShips] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState<boolean>(false);

  // Load data from helper function
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const { ocs, groups, tags, ships } = await loadAllData();
        setAllOcs(ocs);
        setAllGroups(groups);
        setAllTags(tags);
        setAllShips(ships);

        const formattedData = formatDataForGroups(ocs, groups, [], [], ships);
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

  // Update filtered data when selected tags or ships change
  useEffect(() => {
    if (allOcs.length > 0 && allGroups.length > 0) {
      const formattedData = formatDataForGroups(
        allOcs,
        allGroups,
        selectedTags,
        selectedShips,
        allShips
      );
      setGroupWithOcsData(formattedData);
    }
  }, [selectedTags, selectedShips, allOcs, allGroups, allShips]);

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

  const handleShipToggle = (shipName: string): void => {
    setSelectedShips((prev) => {
      if (prev.includes(shipName)) {
        return prev.filter((ship) => ship !== shipName);
      } else {
        return [...prev, shipName];
      }
    });
  };

  const handleClearAllTags = (): void => {
    setSelectedTags([]);
  };

  const handleClearAllShips = (): void => {
    setSelectedShips([]);
  };

  const toggleFilterVisibility = (): void => {
    setShowFilter((prev) => !prev);
  };

  if (isLoading) {
    return <div>Loading characters...</div>;
  }

  return (
    <div className="page-padded">
      <div className="filter-toggle-container">
        <ButtonWrapper
          className="filter-toggle-button div-3d-with-shadow"
          onClick={toggleFilterVisibility}
          soundFile={buttonSound}
        >
          {showFilter ? "Hide search" : "🔍 Search"}
          {(selectedTags.length > 0 || selectedShips.length > 0) &&
            ` (${selectedTags.length + selectedShips.length} active)`}
        </ButtonWrapper>
      </div>
      {showFilter && (
        <FilterBlock
          tags={allTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          onClearAll={handleClearAllTags}
          ships={allShips}
          selectedShips={selectedShips}
          onShipToggle={handleShipToggle}
          onClearAllShips={handleClearAllShips}
        />
      )}
      <div>
        {groupWithOcsData
          .filter((groupInfo) => groupInfo.ocList.length > 0)
          .map((groupInfo) => (
            <OcGroup
              key={groupInfo.slug}
              groupInfo={groupInfo}
              isExpanded={expandedGroups[groupInfo.slug]}
              onToggle={toggleGroup}
              ships={allShips}
              selectedShips={selectedShips}
            />
          ))}
      </div>
    </div>
  );
};

export default PageOcList;
