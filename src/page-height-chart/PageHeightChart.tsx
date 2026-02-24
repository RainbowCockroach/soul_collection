import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import "./PageHeightChart.css";
import heightChartNumber from "../assets/height_chart_number.webp";
import heightChartLines from "../assets/height_chart_lines.webp";
import type { HeightChartGroup } from "../helpers/objects";
import { loadHeightChartGroups } from "../helpers/data-load";
import {
  getHeightChartSelections,
  setHeightChartSelections,
} from "../helpers/height-chart-cart";
import ButtonWrapper from "../common-components/ButtonWrapper";

const selectorSound = "/soul_collection/sound-effect/button_oc_slot.mp3";
const variantSound = "/soul_collection/sound-effect/button_gallery_item.mp3";

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
  const [spriteGroups, setSpriteGroups] = useState<HeightChartGroup[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<
    SelectedCharacter[]
  >([]);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(
    null,
  );
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [lineRepeatCount, setLineRepeatCount] = useState(10);
  const [chartScale, setChartScale] = useState(1);
  const [originalChartHeight, setOriginalChartHeight] = useState(0);
  const [initializedFromStorage, setInitializedFromStorage] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
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

  // Load height chart data
  useEffect(() => {
    loadHeightChartGroups().then(setSpriteGroups);
  }, []);

  // Initialize selectedCharacters from localStorage once data is loaded
  useEffect(() => {
    if (spriteGroups.length === 0 || initializedFromStorage) return;
    setInitializedFromStorage(true);
    const savedIds = getHeightChartSelections();
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
  }, [spriteGroups, initializedFromStorage, spriteById]);

  // Sync selectedCharacters IDs back to localStorage whenever they change
  useEffect(() => {
    if (!initializedFromStorage) return;
    setHeightChartSelections(selectedCharacters.map((c) => c.id));
  }, [selectedCharacters, initializedFromStorage]);

  // Get original chart height from the numbers image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalChartHeight(img.naturalHeight);
    };
    img.src = heightChartNumber;
  }, []);

  // Calculate scale factor and line repeat count
  useEffect(() => {
    const updateScale = () => {
      if (chartRef.current && originalChartHeight > 0) {
        const containerHeight = chartRef.current.clientHeight;
        const scale = containerHeight / originalChartHeight;
        setChartScale(scale);

        // Calculate line repeat count based on scaled width
        const chartWidth = chartRef.current.clientWidth;
        const estimatedLineWidth = 50 * scale; // lines scale with chart
        const count = Math.ceil(chartWidth / estimatedLineWidth) + 5;
        setLineRepeatCount(count);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [originalChartHeight]);

  const isGroupSelected = useCallback(
    (group: HeightChartGroup) =>
      selectedCharacters.some((char) =>
        group.variants.some((sprite) => sprite.id === char.id),
      ),
    [selectedCharacters],
  );

  const toggleCharacterSelection = useCallback((characterId: string) => {
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
  }, []);

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
            setPopupPosition({ top: rect.top, left: rect.left + rect.width / 2 });
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
    [selectedCharacters, toggleCharacterSelection],
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

  const handleClearAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCharacters([]);
    setActiveCharacterId(null);
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
  }, [dragState]);

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
    <div className="height-chart-page">
      {/* Main chart area */}
      <div
        className="height-chart-container"
        ref={chartRef}
        onClick={handleChartClick}
      >
        {/* Background with number scale and lines */}
        <div className="height-chart-background">
          <img
            src={heightChartNumber}
            alt="Height scale numbers"
            className="height-chart-numbers"
            draggable={false}
          />
          <div className="height-chart-lines-container">
            {Array.from({ length: lineRepeatCount }).map((_, index) => (
              <img
                key={index}
                src={heightChartLines}
                alt=""
                className="height-chart-lines"
                draggable={false}
              />
            ))}
          </div>
        </div>

        {/* Clear all button */}
        {selectedCharacters.length > 0 && (
          <button
            className="height-chart-clear-all"
            onClick={handleClearAll}
            title="Clear all characters"
          >
            Clear all
          </button>
        )}

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
                    opacity: isActive ? 1 : 0.7,
                    transform: `translateX(-50%) scale(${chartScale})`,
                    transformOrigin: "bottom center",
                    "--counter-scale": 1 / chartScale,
                  } as React.CSSProperties
                }
                onMouseDown={(e) => handleMouseDown(e, character.id)}
                onTouchStart={(e) => handleTouchStart(e, character.id)}
                onClick={(e) => handleCharacterClick(e, character.id)}
              >
                <div className="height-chart-sprite-label">
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
                onClick={() => handleVariantSelect(sprite.id, expandedGroup.variants)}
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
