import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import OcGroupCover from "./OcGroupCover";
import OcSlot from "./OcSlot";
import FilterBlock from "./FilterBlock";
import { loadAllData } from "../helpers/data-load";
import type { OC, Group, Tag, Ship } from "../helpers/objects";
import ButtonWrapper from "../common-components/ButtonWrapper";
import { useSafeMode } from "../safe-mode/SafeModeContext";
import { isOcCensored, isTagCensored } from "../safe-mode/safe-mode-censor";
import buttonSound from "/sound-effect/button_gallery_item.mp3";
import LoadingSpinner from "../common-components/LoadingSpinner";
import { baseUrl } from "../helpers/constants";
import "./OcGroupCover.css";
import "./PageOcList.css";
import "./OcGroup.css";
import "./FilterBlock.css";
import Divider from "../common-components/Divider";
import buttonSoundHover from "/sound-effect/button_hover.mp3";

const DEFAULT_FRAME_COLOUR = "#ffffff";
const DEFAULT_TEXT_COLOUR = "#000000";

const PageOcList: React.FC = () => {
  const navigate = useNavigate();
  const { isSafeModeEnabled } = useSafeMode();
  const [groups, setGroups] = useState<Group[]>([]);
  const [allOcs, setAllOcs] = useState<OC[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allShips, setAllShips] = useState<Ship[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedShips, setSelectedShips] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const restrictedSlugs = useMemo(() => {
    if (!isSafeModeEnabled) return new Set<string>();
    return new Set(
      allOcs.filter((oc) => isOcCensored(oc.slug)).map((oc) => oc.slug),
    );
  }, [isSafeModeEnabled, allOcs]);

  const visibleTags = useMemo(() => {
    if (!isSafeModeEnabled) return allTags;
    return allTags.filter((tag) => !isTagCensored(tag.slug));
  }, [isSafeModeEnabled, allTags]);

  const groupBySlug = useMemo(() => {
    const map = new Map<string, Group>();
    groups.forEach((g) => map.set(g.slug, g));
    return map;
  }, [groups]);

  const filteredOcs = useMemo(() => {
    return allOcs.filter((oc) => {
      if (selectedTags.length > 0) {
        if (!selectedTags.every((t) => oc.tags.includes(t))) return false;
      }
      if (selectedShips.length > 0) {
        const inAnyShip = selectedShips.some((shipName) => {
          const ship = allShips.find((s) => s.name === shipName);
          return ship ? ship.oc.includes(oc.slug) : false;
        });
        if (!inAnyShip) return false;
      }
      return true;
    });
  }, [allOcs, selectedTags, selectedShips, allShips]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const { ocs, groups, tags, ships } = await loadAllData();
        setGroups(groups);
        setAllOcs(ocs);
        setAllTags(tags);
        setAllShips(ships);
      } catch (error) {
        console.error("Error loading OC data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getShipColorsForOc = (ocSlug: string): string[] => {
    if (selectedShips.length > 0) {
      return selectedShips
        .map((shipName) => {
          const ship = allShips.find(
            (s) => s.name === shipName && s.oc.includes(ocSlug),
          );
          return ship ? ship.color : null;
        })
        .filter((c): c is string => c !== null);
    }
    return allShips.filter((s) => s.oc.includes(ocSlug)).map((s) => s.color);
  };

  const getShipTextsForOc = (ocSlug: string): string[] => {
    if (selectedShips.length > 0) {
      return selectedShips
        .map((shipName) => {
          const ship = allShips.find(
            (s) => s.name === shipName && s.oc.includes(ocSlug),
          );
          return ship ? ship.shipText?.[ocSlug] : null;
        })
        .filter((t): t is string => !!t);
    }
    return allShips
      .filter((s) => s.oc.includes(ocSlug))
      .map((s) => s.shipText?.[ocSlug])
      .filter((t): t is string => !!t);
  };

  const getColoursForOc = (oc: OC): { frame: string; text: string } => {
    const firstGroup = oc.group.map((g) => groupBySlug.get(g)).find(Boolean);
    return {
      frame: firstGroup?.frameColour ?? DEFAULT_FRAME_COLOUR,
      text: firstGroup?.groupHeaderTextColour ?? DEFAULT_TEXT_COLOUR,
    };
  };

  const handleTagToggle = (tagSlug: string): void => {
    setSelectedTags((prev) =>
      prev.includes(tagSlug)
        ? prev.filter((t) => t !== tagSlug)
        : [...prev, tagSlug],
    );
  };

  const handleShipToggle = (shipName: string): void => {
    setSelectedShips((prev) =>
      prev.includes(shipName)
        ? prev.filter((s) => s !== shipName)
        : [...prev, shipName],
    );
  };

  const handleClearAllTags = (): void => setSelectedTags([]);
  const handleClearAllShips = (): void => setSelectedShips([]);
  const toggleFilterVisibility = (): void => setShowFilter((prev) => !prev);

  if (isLoading) {
    return <LoadingSpinner message="Loading characters..." />;
  }

  return (
    <div className="page-padded">
      <img
        src="https://64.media.tumblr.com/cc2a05163e112a77aa67ec907194af6a/5455e7c46f224202-6f/s250x400/547152a78bf26fd886933e2b88be9d20fdf05261.webp"
        style={{ width: "64px", height: "64px" }}
      />
      <div className="oc-group-cover-grid space-above space-below">
        {groups.map((group) => (
          <ButtonWrapper
            key={group.slug}
            className="oc-group-cover-button"
            onClick={() => navigate(`/${baseUrl}/group/${group.slug}`)}
            soundFile={buttonSound}
            hoverSoundFile={buttonSoundHover}
          >
            <OcGroupCover
              groupInfo={{
                slug: group.slug,
                name: group.name,
                frameColour: group.frameColour,
                groupHeaderTextColour: group.groupHeaderTextColour,
                headerImage: group.headerImage,
              }}
            />
          </ButtonWrapper>
        ))}
      </div>

      <Divider />

      <div className="filter-toggle-container space-above">
        <ButtonWrapper
          className="filter-toggle-button div-3d-with-shadow"
          onClick={toggleFilterVisibility}
          soundFile={buttonSound}
          hoverSoundFile={buttonSoundHover}
        >
          {showFilter ? "Hide search" : "🔍 Search"}
          {(selectedTags.length > 0 || selectedShips.length > 0) &&
            ` (${selectedTags.length + selectedShips.length} active)`}
        </ButtonWrapper>
      </div>
      {showFilter && (
        <FilterBlock
          tags={visibleTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          onClearAll={handleClearAllTags}
          ships={allShips}
          selectedShips={selectedShips}
          onShipToggle={handleShipToggle}
          onClearAllShips={handleClearAllShips}
        />
      )}

      <div className="oc-list-flat-content space-above">
        <div className="oc-group-grid">
          {filteredOcs.map((oc) => {
            const colours = getColoursForOc(oc);
            return (
              <OcSlot
                key={oc.slug}
                oc={{ slug: oc.slug, name: oc.name, avatar: oc.avatar }}
                frameColour={colours.frame}
                textColour={colours.text}
                shipColors={getShipColorsForOc(oc.slug)}
                shipTexts={getShipTextsForOc(oc.slug)}
                disabled={restrictedSlugs.has(oc.slug)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PageOcList;
