import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import "./PageHeightChart.css";
import heightChartNumber from "../assets/height_chart_number.webp";
import heightChartLines from "../assets/height_chart_lines.webp";
import type { HeightChartGroup, HeightChartMode } from "../helpers/objects";
import {
  loadHeightChartGroups,
  loadGodlyHeightChartGroups,
  loadOCs,
} from "../helpers/data-load";
import {
  getHeightChartSelections,
  setHeightChartSelections,
} from "../helpers/height-chart-cart";
import { useSafeMode } from "../safe-mode/SafeModeContext";
import { isOcCensored } from "../safe-mode/safe-mode-censor";
import ButtonWrapper from "../common-components/ButtonWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEye,
  faEyeLowVision,
  faFont,
  faTextSlash,
} from "@fortawesome/free-solid-svg-icons";
import buttonSound from "/sound-effect/button_oc_slot_aggressive.mp3";

const selectorSound = "/soul_collection/sound-effect/button_oc_slot.mp3";
const variantSound = "/soul_collection/sound-effect/button_gallery_item.mp3";

// Background images per mode — godly falls back to mortal until custom assets are added
const BACKGROUND_ASSETS: Record<
  HeightChartMode,
  { number: string; lines: string }
> = {
  mortal: { number: heightChartNumber, lines: heightChartLines },
  godly: { number: heightChartNumber, lines: heightChartLines },
};

const TAB_LABELS: Record<HeightChartMode, string> = {
  mortal: "Mortals",
  godly: "God Forms",
};

interface SelectedCharacter {
  id: string;
  x: number;
}

interface DragState {
  id: string;
  startX: number;
  startCharacterX: number;
}

export default function PageHeightChart() {
  const { isSafeModeEnabled } = useSafeMode();

  // ── Mode / Tab ──────────────────────────────────────────────────────
  const [mode, setMode] = useState<HeightChartMode>("mortal");

  // ── Data per mode ───────────────────────────────────────────────────
  const [allMortalGroups, setAllMortalGroups] = useState<HeightChartGroup[]>(
    [],
  );
  const [allGodlyGroups, setAllGodlyGroups] = useState<HeightChartGroup[]>([]);
  const [restrictedGroupIds, setRestrictedGroupIds] = useState<Set<string>>(
    new Set(),
  );

  const allSpriteGroups = mode === "mortal" ? allMortalGroups : allGodlyGroups;

  const spriteGroups = useMemo(() => {
    if (!isSafeModeEnabled) return allSpriteGroups;
    return allSpriteGroups.filter(
      (group) => !restrictedGroupIds.has(group.groupId),
    );
  }, [allSpriteGroups, isSafeModeEnabled, restrictedGroupIds]);

  // ── Selections per mode (kept independently) ───────────────────────
  const [mortalSelected, setMortalSelected] = useState<SelectedCharacter[]>([]);
  const [godlySelected, setGodlySelected] = useState<SelectedCharacter[]>([]);

  const selectedCharacters = mode === "mortal" ? mortalSelected : godlySelected;
  const setSelectedCharacters =
    mode === "mortal" ? setMortalSelected : setGodlySelected;

  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(
    null,
  );
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [solidified, setSolidified] = useState(false);
  const [hideLabels, setHideLabels] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [lineRepeatCount, setLineRepeatCount] = useState(10);
  const [chartScale, setChartScale] = useState(1);
  const [mortalInitialized, setMortalInitialized] = useState(false);
  const [godlyInitialized, setGodlyInitialized] = useState(false);

  const initializedFromStorage =
    mode === "mortal" ? mortalInitialized : godlyInitialized;
  const setInitializedFromStorage =
    mode === "mortal" ? setMortalInitialized : setGodlyInitialized;

  const chartRef = useRef<HTMLDivElement>(null);
  const numbersImgRef = useRef<HTMLImageElement>(null);
  const variantPopupRef = useRef<HTMLDivElement>(null);

  const expandedGroup = useMemo(
    () => spriteGroups.find((g) => g.groupId === expandedGroupId) ?? null,
    [spriteGroups, expandedGroupId],
  );

  // Flat list of all sprites for quick lookup
  const spriteById = useMemo(() => {
    const map = new Map();
    spriteGroups.forEach((group) => {
      group.variants.forEach((sprite) => {
        map.set(sprite.id, { ...sprite, name: group.name });
      });
    });
    return map;
  }, [spriteGroups]);

  // Background images for current mode
  const bgAssets = BACKGROUND_ASSETS[mode];

  // ── Load data ───────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      const [mortal, godly, ocs] = await Promise.all([
        loadHeightChartGroups(),
        loadGodlyHeightChartGroups(),
        loadOCs(),
      ]);
      setAllMortalGroups(mortal);
      setAllGodlyGroups(godly);
      const restricted = new Set(
        ocs.filter((oc) => isOcCensored(oc.slug)).map((oc) => oc.slug),
      );
      setRestrictedGroupIds(restricted);
    };
    loadData();
  }, []);

  // Initialize selectedCharacters from localStorage once data is loaded
  useEffect(() => {
    if (spriteGroups.length === 0 || initializedFromStorage) return;
    setInitializedFromStorage(true);
    const savedIds = getHeightChartSelections(mode);
    if (savedIds.length === 0) return;
    const validIds = savedIds.filter((id) => spriteById.has(id));
    if (validIds.length === 0) return;
    const chartWidth = chartRef.current?.clientWidth || 800;
    setSelectedCharacters(
      validIds.map((id, index) => ({
        id,
        x: (chartWidth / (validIds.length + 1)) * (index + 1),
      })),
    );
  }, [
    spriteGroups,
    initializedFromStorage,
    spriteById,
    mode,
    setInitializedFromStorage,
    setSelectedCharacters,
  ]);

  // Sync selectedCharacters IDs back to localStorage whenever they change
  useEffect(() => {
    if (!mortalInitialized) return;
    setHeightChartSelections(
      mortalSelected.map((c) => c.id),
      "mortal",
    );
  }, [mortalSelected, mortalInitialized]);

  useEffect(() => {
    if (!godlyInitialized) return;
    setHeightChartSelections(
      godlySelected.map((c) => c.id),
      "godly",
    );
  }, [godlySelected, godlyInitialized]);

  // Calculate scale factor and line repeat count from the rendered numbers image
  useEffect(() => {
    const updateScale = () => {
      const imgEl = numbersImgRef.current;
      const chartEl = chartRef.current;
      if (!imgEl || !chartEl || imgEl.naturalHeight === 0) return;

      const containerHeight = chartEl.clientHeight;
      const scale = containerHeight / imgEl.naturalHeight;
      setChartScale(scale);

      const chartWidth = chartEl.clientWidth;
      const estimatedLineWidth = 50 * scale;
      const count = Math.ceil(chartWidth / estimatedLineWidth) + 5;
      setLineRepeatCount(count);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // ── Tab switching ───────────────────────────────────────────────────
  const handleModeSwitch = useCallback(
    (newMode: HeightChartMode) => {
      if (newMode === mode) return;
      // Reset transient state
      setActiveCharacterId(null);
      setDragState(null);
      setExpandedGroupId(null);
      setPopupPosition(null);
      setMode(newMode);
    },
    [mode],
  );

  const isGroupSelected = useCallback(
    (group: HeightChartGroup) =>
      selectedCharacters.some((char) =>
        group.variants.some((sprite) => sprite.id === char.id),
      ),
    [selectedCharacters],
  );

  const toggleCharacterSelection = useCallback(
    (characterId: string) => {
      setSelectedCharacters((prev) => {
        const isSelected = prev.some((char) => char.id === characterId);

        if (isSelected) {
          // Deselect
          const remaining = prev.filter((char) => char.id !== characterId);
          setActiveCharacterId(
            remaining.length > 0 ? remaining[remaining.length - 1].id : null,
          );
          return remaining;
        } else {
          // Select - add at center
          const chartWidth = chartRef.current?.clientWidth || 800;
          setActiveCharacterId(characterId);
          return [...prev, { id: characterId, x: chartWidth / 2 }];
        }
      });
    },
    [setSelectedCharacters],
  );

  const handleGroupClick = useCallback(
    (group: HeightChartGroup, containerEl: HTMLDivElement) => {
      const selectedFromGroup = selectedCharacters.find((char) =>
        group.variants.some((sprite) => sprite.id === char.id),
      );

      if (selectedFromGroup) {
        // Focus the sprite on screen — never deselect
        setActiveCharacterId(selectedFromGroup.id);
        if (group.variants.length > 1) {
          // Toggle popup for variant switching
          if (expandedGroupId === group.groupId) {
            setExpandedGroupId(null);
            setPopupPosition(null);
          } else {
            const rect = containerEl.getBoundingClientRect();
            setPopupPosition({
              top: rect.top,
              left: rect.left + rect.width / 2,
            });
            setExpandedGroupId(group.groupId);
          }
        }
      } else if (group.variants.length === 1) {
        toggleCharacterSelection(group.variants[0].id);
        setExpandedGroupId(null);
        setPopupPosition(null);
      } else if (expandedGroupId === group.groupId) {
        setExpandedGroupId(null);
        setPopupPosition(null);
      } else {
        const rect = containerEl.getBoundingClientRect();
        setPopupPosition({ top: rect.top, left: rect.left + rect.width / 2 });
        setExpandedGroupId(group.groupId);
      }
    },
    [selectedCharacters, toggleCharacterSelection, expandedGroupId],
  );

  const handleVariantSelect = useCallback(
    (spriteId: string, groupVariants: HeightChartGroup["variants"]) => {
      const existingFromGroup = selectedCharacters.find((char) =>
        groupVariants.some((sprite) => sprite.id === char.id),
      );

      if (existingFromGroup) {
        // Replace existing variant at same position
        setSelectedCharacters((prev) =>
          prev.map((char) =>
            char.id === existingFromGroup.id ? { ...char, id: spriteId } : char,
          ),
        );
        setActiveCharacterId(spriteId);
      } else {
        toggleCharacterSelection(spriteId);
      }
      setExpandedGroupId(null);
      setPopupPosition(null);
    },
    [selectedCharacters, toggleCharacterSelection, setSelectedCharacters],
  );

  const handleCharacterClick = useCallback(
    (e: React.MouseEvent, characterId: string) => {
      e.stopPropagation();
      setActiveCharacterId(characterId);
    },
    [],
  );

  const handleChartClick = useCallback(() => {
    setActiveCharacterId(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedCharacters([]);
    setActiveCharacterId(null);
    setSolidified(false);
  }, [setSelectedCharacters]);

  const handleSolidifyAll = useCallback(() => {
    setSolidified((prev) => !prev);
  }, []);

  const startDrag = useCallback(
    (characterId: string, clientX: number) => {
      const character = selectedCharacters.find(
        (char) => char.id === characterId,
      );
      if (character) {
        setDragState({
          id: characterId,
          startX: clientX,
          startCharacterX: character.x,
        });
        setActiveCharacterId(characterId);
      }
    },
    [selectedCharacters],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, characterId: string) => {
      e.preventDefault();
      startDrag(characterId, e.clientX);
    },
    [startDrag],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, characterId: string) => {
      startDrag(characterId, e.touches[0].clientX);
    },
    [startDrag],
  );

  // Handle drag operations
  useEffect(() => {
    if (!dragState) return;

    const updatePosition = (clientX: number) => {
      const deltaX = clientX - dragState.startX;
      setSelectedCharacters((prev) =>
        prev.map((char) =>
          char.id === dragState.id
            ? { ...char, x: dragState.startCharacterX + deltaX }
            : char,
        ),
      );
    };

    const handleMouseMove = (e: MouseEvent) => updatePosition(e.clientX);
    const handleTouchMove = (e: TouchEvent) =>
      updatePosition(e.touches[0].clientX);
    const endDrag = () => setDragState(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", endDrag);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", endDrag);
    };
  }, [dragState, setSelectedCharacters]);

  // Click outside to close variant popup
  useEffect(() => {
    if (!expandedGroupId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        variantPopupRef.current?.contains(target) ||
        target.closest(".height-chart-selector-group")
      ) {
        return;
      }
      setExpandedGroupId(null);
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandedGroupId]);

  return (
    <div className={`height-chart-page height-chart-mode-${mode}`}>
      {/* Toolbar above chart */}
      <div className="height-chart-toolbar">
        {/* Mode tabs */}
        <div className="height-chart-tabs">
          {(["mortal", "godly"] as HeightChartMode[]).map((m) => (
            <ButtonWrapper
              key={m}
              className={`height-chart-tab${mode === m ? " active" : ""}`}
              onClick={() => handleModeSwitch(m)}
            >
              {TAB_LABELS[m]}
            </ButtonWrapper>
          ))}
        </div>

        {selectedCharacters.length > 0 && (
          <>
            <ButtonWrapper
              className={`height-chart-hide-labels${hideLabels ? " active" : ""}`}
              onClick={() => setHideLabels((prev) => !prev)}
            >
              <FontAwesomeIcon icon={hideLabels ? faTextSlash : faFont} />
            </ButtonWrapper>
            <ButtonWrapper
              className={`height-chart-solidify-all${solidified ? " active" : ""}`}
              onClick={handleSolidifyAll}
            >
              <FontAwesomeIcon icon={solidified ? faEye : faEyeLowVision} />
            </ButtonWrapper>
            <ButtonWrapper
              className="height-chart-clear-all"
              onClick={handleClearAll}
              soundFile={buttonSound}
            >
              <FontAwesomeIcon icon={faTrash} />
            </ButtonWrapper>
          </>
        )}
      </div>

      {/* Main chart area */}
      <div
        className="height-chart-container"
        ref={chartRef}
        onClick={handleChartClick}
      >
        {/* Background with number scale and lines */}
        <div className="height-chart-background">
          <img
            ref={numbersImgRef}
            src={bgAssets.number}
            alt="Height scale numbers"
            className="height-chart-numbers"
            draggable={false}
            onLoad={() => {
              const imgEl = numbersImgRef.current;
              const chartEl = chartRef.current;
              if (!imgEl || !chartEl || imgEl.naturalHeight === 0) return;
              const containerHeight = chartEl.clientHeight;
              const scale = containerHeight / imgEl.naturalHeight;
              setChartScale(scale);
              const chartWidth = chartEl.clientWidth;
              const estimatedLineWidth = 50 * scale;
              setLineRepeatCount(
                Math.ceil(chartWidth / estimatedLineWidth) + 5,
              );
            }}
          />
          <div className="height-chart-lines-container">
            {Array.from({ length: lineRepeatCount }).map((_, index) => (
              <img
                key={index}
                src={bgAssets.lines}
                alt=""
                className="height-chart-lines"
                draggable={false}
              />
            ))}
          </div>
        </div>

        {/* Character sprites */}
        <div className="height-chart-sprites">
          {selectedCharacters.map((character) => {
            const sprite = spriteById.get(character.id);
            if (!sprite) return null;

            const isActive = activeCharacterId === character.id;
            const isDragging = dragState?.id === character.id;

            return (
              <div
                key={character.id}
                className={`height-chart-sprite ${isActive ? "active" : ""} ${
                  isDragging ? "dragging" : ""
                }`}
                style={
                  {
                    left: `${character.x}px`,
                    opacity: solidified
                      ? dragState
                        ? isDragging
                          ? 1
                          : 0.7
                        : 1
                      : isActive
                        ? 1
                        : 0.7,
                    transform: `translateX(-50%) scale(${chartScale})`,
                    transformOrigin: "bottom center",
                    "--counter-scale": 1 / chartScale,
                  } as React.CSSProperties
                }
                onMouseDown={(e) => handleMouseDown(e, character.id)}
                onTouchStart={(e) => handleTouchStart(e, character.id)}
                onClick={(e) => handleCharacterClick(e, character.id)}
              >
                <div
                  className={`height-chart-sprite-label${hideLabels ? " hidden" : ""}`}
                >
                  <span className="height-chart-sprite-name">
                    {sprite.name}
                  </span>
                  <span className="height-chart-sprite-height">
                    {sprite.height}
                  </span>
                </div>
                <img src={sprite.url} alt={sprite.name} draggable={false} />
                {/* Close button - positioned relative to sprite */}
                {isActive && (
                  <button
                    className="height-chart-sprite-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCharacterSelection(character.id);
                    }}
                    title="Remove character"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom selection bar */}
      <div className="height-chart-selector">
        <div className="height-chart-selector-inner">
          {spriteGroups.map((group) => {
            const isExpanded = expandedGroupId === group.groupId;

            return (
              <div
                key={group.groupId}
                className="height-chart-selector-group"
                data-group-id={group.groupId}
              >
                <ButtonWrapper
                  className={`height-chart-selector-item ${
                    isGroupSelected(group) ? "selected" : ""
                  } ${isExpanded ? "expanded" : ""}`}
                  onClick={() => {
                    const el = document.querySelector(
                      `[data-group-id="${group.groupId}"]`,
                    ) as HTMLDivElement | null;
                    if (el) handleGroupClick(group, el);
                  }}
                  soundFile={selectorSound}
                >
                  <img
                    src={group.thumbnail}
                    alt={group.name}
                    draggable={false}
                  />
                  <span className="height-chart-selector-item-name">
                    {group.name}
                  </span>
                </ButtonWrapper>
              </div>
            );
          })}
        </div>
      </div>

      {/* Variant popup — rendered at body level via portal to escape overflow clipping */}
      {expandedGroup &&
        expandedGroup.variants.length > 1 &&
        popupPosition &&
        createPortal(
          <div
            ref={variantPopupRef}
            className="height-chart-variant-popup"
            style={{
              position: "fixed",
              bottom: `${window.innerHeight - popupPosition.top + 10}px`,
              left: `${popupPosition.left}px`,
            }}
          >
            {expandedGroup.variants.map((sprite) => (
              <ButtonWrapper
                key={sprite.id}
                className="height-chart-variant-item"
                onClick={() =>
                  handleVariantSelect(sprite.id, expandedGroup.variants)
                }
                soundFile={variantSound}
              >
                <img
                  src={sprite.thumbnail}
                  alt={expandedGroup.name}
                  draggable={false}
                />
              </ButtonWrapper>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
