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
import Stack from "../common-components/Stack";
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

  // Precompute ship colors/texts per OC once, instead of running nested
  // find/filter for every OC on every render (was O(n*ships) per render).
  const shipInfoByOc = useMemo(() => {
    const map = new Map<string, { colors: string[]; texts: string[] }>();
    const useSelection = selectedShips.length > 0;

    for (const oc of filteredOcs) {
      const relevantShips = useSelection
        ? selectedShips
            .map((shipName) =>
              allShips.find(
                (s) => s.name === shipName && s.oc.includes(oc.slug),
              ),
            )
            .filter((s): s is Ship => s !== undefined)
        : allShips.filter((s) => s.oc.includes(oc.slug));

      map.set(oc.slug, {
        colors: relevantShips.map((s) => s.color),
        texts: relevantShips
          .map((s) => s.shipText?.[oc.slug])
          .filter((t): t is string => !!t),
      });
    }
    return map;
  }, [filteredOcs, allShips, selectedShips]);

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
    <Stack gap="md" className="page-padded oc-list-page">
      <Stack gap="sm">
        <div className="div-3d-with-shadow-borderless oc-list-intro-box">
          <img
            src="https://64.media.tumblr.com/cc2a05163e112a77aa67ec907194af6a/5455e7c46f224202-6f/s250x400/547152a78bf26fd886933e2b88be9d20fdf05261.webp"
            className="oc-list-intro-image"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <p>These are characters grouped by their stories.</p>
        </div>

        <div className="oc-group-cover-grid">
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
      </Stack>

      <Divider />

      <Stack gap="sm">
        <div className="div-3d-with-shadow-borderless oc-list-intro-box">
          <img
            src="https://64.media.tumblr.com/cc2a05163e112a77aa67ec907194af6a/5455e7c46f224202-6f/s250x400/547152a78bf26fd886933e2b88be9d20fdf05261.webp"
            className="oc-list-intro-image"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <p>These are all of them. Wall of OCs warning.</p>
        </div>

        <div className="filter-toggle-container">
          <ButtonWrapper
            className="filter-toggle-button div-3d-with-shadow"
            onClick={toggleFilterVisibility}
            soundFile={buttonSound}
            hoverSoundFile={buttonSoundHover}
            ariaExpanded={showFilter}
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

        <div className="oc-list-flat-content">
          <div className="oc-group-grid">
            {filteredOcs.map((oc) => {
              const colours = getColoursForOc(oc);
              const shipInfo = shipInfoByOc.get(oc.slug);
              return (
                <OcSlot
                  key={oc.slug}
                  oc={oc}
                  frameColour={colours.frame}
                  textColour={colours.text}
                  shipColors={shipInfo?.colors}
                  shipTexts={shipInfo?.texts}
                  disabled={restrictedSlugs.has(oc.slug)}
                />
              );
            })}
          </div>
        </div>
      </Stack>
    </Stack>
  );
};

export default PageOcList;
