import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import "./PageHeightChart.css";
import heightChartNumber from "../assets/height_chart_number.webp";
import heightChartLines from "../assets/height_chart_lines.webp";
import heightChartNumberGodly from "../assets/height_chart_number_godly.webp";
import heightChartLinesGodly from "../assets/height_chart_lines_godly.webp";
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
import switchToGodSound from "/sound-effect/switch_form_birth_to_god.mp3";
import switchToBirthSound from "/sound-effect/switch_form_god_to_birth.mp3";
import variantSoundFile from "/sound-effect/button_gallery_item.mp3";

const selectorSound = "/soul_collection/sound-effect/button_oc_slot.mp3";

const BG_ASSETS: Record<HeightChartMode, { number: string; lines: string }> = {
  mortal: { number: heightChartNumber, lines: heightChartLines },
  godly: { number: heightChartNumberGodly, lines: heightChartLinesGodly },
};

const TAB_LABELS: Record<HeightChartMode, string> = {
  mortal: "Birth Forms",
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

interface ModeState {
  groups: HeightChartGroup[];
  selected: SelectedCharacter[];
  initialized: boolean;
}

const EMPTY_MODE: ModeState = { groups: [], selected: [], initialized: false };

export default function PageHeightChart() {
  const { isSafeModeEnabled } = useSafeMode();

  const [mode, setMode] = useState<HeightChartMode>("mortal");
  const [modeData, setModeData] = useState<Record<HeightChartMode, ModeState>>({
    mortal: EMPTY_MODE,
    godly: EMPTY_MODE,
  });
  const [restrictedGroupIds, setRestrictedGroupIds] = useState<Set<string>>(
    new Set(),
  );

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

  const chartRef = useRef<HTMLDivElement>(null);
  const numbersImgRef = useRef<HTMLImageElement>(null);
  const variantPopupRef = useRef<HTMLDivElement>(null);

  // ── Derived state ─────────────────────────────────────────────────────
  const current = modeData[mode];
  const selectedCharacters = current.selected;

  const updateMode = useCallback(
    (m: HeightChartMode, patch: Partial<ModeState>) =>
      setModeData((prev) => ({ ...prev, [m]: { ...prev[m], ...patch } })),
    [],
  );

  const setSelectedCharacters = useCallback(
    (updater: SelectedCharacter[] | ((prev: SelectedCharacter[]) => SelectedCharacter[])) =>
      setModeData((prev) => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          selected: typeof updater === "function" ? updater(prev[mode].selected) : updater,
        },
      })),
    [mode],
  );

  const spriteGroups = useMemo(() => {
    if (!isSafeModeEnabled) return current.groups;
    return current.groups.filter((g) => !restrictedGroupIds.has(g.groupId));
  }, [current.groups, isSafeModeEnabled, restrictedGroupIds]);

  const expandedGroup = useMemo(
    () => spriteGroups.find((g) => g.groupId === expandedGroupId) ?? null,
    [spriteGroups, expandedGroupId],
  );

  const spriteById = useMemo(() => {
    const map = new Map<string, { url: string; thumbnail: string; height: string; id: string; name: string }>();
    for (const group of spriteGroups) {
      for (const sprite of group.variants) {
        map.set(sprite.id, { ...sprite, name: group.name });
      }
    }
    return map;
  }, [spriteGroups]);

  const bgAssets = BG_ASSETS[mode];

  // ── Scale calculation (shared between resize listener and img onLoad) ─
  const recalcScale = useCallback(() => {
    const imgEl = numbersImgRef.current;
    const chartEl = chartRef.current;
    if (!imgEl || !chartEl || imgEl.naturalHeight === 0) return;

    const scale = chartEl.clientHeight / imgEl.naturalHeight;
    setChartScale(scale);
    setLineRepeatCount(Math.ceil(chartEl.clientWidth / (50 * scale)) + 5);
  }, []);

  // ── Load data ─────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([loadHeightChartGroups(), loadGodlyHeightChartGroups(), loadOCs()]).then(
      ([mortal, godly, ocs]) => {
        updateMode("mortal", { groups: mortal });
        updateMode("godly", { groups: godly });
        setRestrictedGroupIds(
          new Set(ocs.filter((oc) => isOcCensored(oc.slug)).map((oc) => oc.slug)),
        );
      },
    );
  }, [updateMode]);

  // Restore selections from localStorage once groups are loaded
  useEffect(() => {
    if (spriteGroups.length === 0 || current.initialized) return;
    updateMode(mode, { initialized: true });

    const savedIds = getHeightChartSelections(mode).filter((id) => spriteById.has(id));
    if (savedIds.length === 0) return;

    const chartWidth = chartRef.current?.clientWidth || 800;
    setSelectedCharacters(
      savedIds.map((id, i) => ({
        id,
        x: (chartWidth / (savedIds.length + 1)) * (i + 1),
      })),
    );
  }, [spriteGroups, current.initialized, spriteById, mode, updateMode, setSelectedCharacters]);

  // Persist selections to localStorage
  useEffect(() => {
    if (!modeData.mortal.initialized) return;
    setHeightChartSelections(modeData.mortal.selected.map((c) => c.id), "mortal");
  }, [modeData.mortal.selected, modeData.mortal.initialized]);

  useEffect(() => {
    if (!modeData.godly.initialized) return;
    setHeightChartSelections(modeData.godly.selected.map((c) => c.id), "godly");
  }, [modeData.godly.selected, modeData.godly.initialized]);

  // Recalculate scale on resize
  useEffect(() => {
    recalcScale();
    window.addEventListener("resize", recalcScale);
    return () => window.removeEventListener("resize", recalcScale);
  }, [recalcScale]);

  // ── Tab switching ─────────────────────────────────────────────────────
  const handleModeSwitch = useCallback(
    (newMode: HeightChartMode) => {
      if (newMode === mode) return;
      setActiveCharacterId(null);
      setDragState(null);
      setExpandedGroupId(null);
      setPopupPosition(null);
      setMode(newMode);
    },
    [mode],
  );

  // ── Selection helpers ─────────────────────────────────────────────────
  const isGroupSelected = useCallback(
    (group: HeightChartGroup) =>
      selectedCharacters.some((c) => group.variants.some((v) => v.id === c.id)),
    [selectedCharacters],
  );

  const closePopup = useCallback(() => {
    setExpandedGroupId(null);
    setPopupPosition(null);
  }, []);

  const toggleCharacterSelection = useCallback(
    (characterId: string) => {
      setSelectedCharacters((prev) => {
        const existing = prev.find((c) => c.id === characterId);
        if (existing) {
          const remaining = prev.filter((c) => c.id !== characterId);
          setActiveCharacterId(remaining.at(-1)?.id ?? null);
          return remaining;
        }
        setActiveCharacterId(characterId);
        return [...prev, { id: characterId, x: (chartRef.current?.clientWidth || 800) / 2 }];
      });
    },
    [setSelectedCharacters],
  );

  const handleGroupClick = useCallback(
    (group: HeightChartGroup, containerEl: HTMLDivElement) => {
      const selectedFromGroup = selectedCharacters.find((c) =>
        group.variants.some((v) => v.id === c.id),
      );

      if (selectedFromGroup) {
        setActiveCharacterId(selectedFromGroup.id);
        if (group.variants.length <= 1) return;
        // Toggle popup for variant switching
        if (expandedGroupId === group.groupId) {
          closePopup();
        } else {
          const rect = containerEl.getBoundingClientRect();
          setPopupPosition({ top: rect.top, left: rect.left + rect.width / 2 });
          setExpandedGroupId(group.groupId);
        }
        return;
      }

      if (group.variants.length === 1) {
        toggleCharacterSelection(group.variants[0].id);
        closePopup();
      } else if (expandedGroupId === group.groupId) {
        closePopup();
      } else {
        const rect = containerEl.getBoundingClientRect();
        setPopupPosition({ top: rect.top, left: rect.left + rect.width / 2 });
        setExpandedGroupId(group.groupId);
      }
    },
    [selectedCharacters, toggleCharacterSelection, expandedGroupId, closePopup],
  );

  const handleVariantSelect = useCallback(
    (spriteId: string, groupVariants: HeightChartGroup["variants"]) => {
      const existingFromGroup = selectedCharacters.find((c) =>
        groupVariants.some((v) => v.id === c.id),
      );

      if (existingFromGroup) {
        setSelectedCharacters((prev) =>
          prev.map((c) => (c.id === existingFromGroup.id ? { ...c, id: spriteId } : c)),
        );
        setActiveCharacterId(spriteId);
      } else {
        toggleCharacterSelection(spriteId);
      }
      closePopup();
    },
    [selectedCharacters, toggleCharacterSelection, setSelectedCharacters, closePopup],
  );

  // ── Drag handling ─────────────────────────────────────────────────────
  const startDrag = useCallback(
    (characterId: string, clientX: number) => {
      const character = selectedCharacters.find((c) => c.id === characterId);
      if (!character) return;
      setDragState({ id: characterId, startX: clientX, startCharacterX: character.x });
      setActiveCharacterId(characterId);
    },
    [selectedCharacters],
  );

  useEffect(() => {
    if (!dragState) return;

    const updatePosition = (clientX: number) => {
      const deltaX = clientX - dragState.startX;
      setSelectedCharacters((prev) =>
        prev.map((c) =>
          c.id === dragState.id ? { ...c, x: dragState.startCharacterX + deltaX } : c,
        ),
      );
    };

    const onMouseMove = (e: MouseEvent) => updatePosition(e.clientX);
    const onTouchMove = (e: TouchEvent) => updatePosition(e.touches[0].clientX);
    const endDrag = () => setDragState(null);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", endDrag);
    };
  }, [dragState, setSelectedCharacters]);

  // Close variant popup on outside click
  useEffect(() => {
    if (!expandedGroupId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (variantPopupRef.current?.contains(target) || target.closest(".height-chart-selector-group"))
        return;
      closePopup();
    };

    const timeoutId = setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandedGroupId, closePopup]);

  // ── Sprite opacity helper ─────────────────────────────────────────────
  const getSpriteOpacity = (isActive: boolean, isDragging: boolean) => {
    if (solidified) return dragState ? (isDragging ? 1 : 0.7) : 1;
    return isActive ? 1 : 0.7;
  };

  return (
    <div className={`height-chart-page height-chart-mode-${mode}`}>
      {/* Toolbar */}
      <div className="height-chart-toolbar">
        <div className="height-chart-tabs">
          {(["mortal", "godly"] as HeightChartMode[]).map((m) => (
            <ButtonWrapper
              key={m}
              className={`height-chart-tab${mode === m ? " active" : ""}`}
              onClick={() => handleModeSwitch(m)}
              soundFile={m === "godly" ? switchToGodSound : switchToBirthSound}
            >
              {TAB_LABELS[m]}
            </ButtonWrapper>
          ))}
        </div>

        {selectedCharacters.length > 0 && (
          <>
            <ButtonWrapper
              className={`height-chart-hide-labels${hideLabels ? " active" : ""}`}
              onClick={() => setHideLabels((v) => !v)}
              soundFile={variantSoundFile}
            >
              <FontAwesomeIcon icon={hideLabels ? faTextSlash : faFont} />
            </ButtonWrapper>
            <ButtonWrapper
              className={`height-chart-solidify-all${solidified ? " active" : ""}`}
              onClick={() => setSolidified((v) => !v)}
              soundFile={variantSoundFile}
            >
              <FontAwesomeIcon icon={solidified ? faEye : faEyeLowVision} />
            </ButtonWrapper>
            <ButtonWrapper
              className="height-chart-clear-all"
              onClick={() => {
                setSelectedCharacters([]);
                setActiveCharacterId(null);
                setSolidified(false);
              }}
              soundFile={buttonSound}
            >
              <FontAwesomeIcon icon={faTrash} />
            </ButtonWrapper>
          </>
        )}
      </div>

      {/* Chart area */}
      <div
        className="height-chart-container"
        ref={chartRef}
        onClick={() => setActiveCharacterId(null)}
      >
        <div className="height-chart-background">
          <img
            ref={numbersImgRef}
            src={bgAssets.number}
            alt="Height scale numbers"
            className="height-chart-numbers"
            draggable={false}
            onLoad={recalcScale}
          />
          <div className="height-chart-lines-container">
            {Array.from({ length: lineRepeatCount }, (_, i) => (
              <img key={i} src={bgAssets.lines} alt="" className="height-chart-lines" draggable={false} />
            ))}
          </div>
        </div>

        <div className="height-chart-sprites">
          {selectedCharacters.map((character) => {
            const sprite = spriteById.get(character.id);
            if (!sprite) return null;

            const isActive = activeCharacterId === character.id;
            const isDragging = dragState?.id === character.id;

            return (
              <div
                key={character.id}
                className={`height-chart-sprite${isActive ? " active" : ""}${isDragging ? " dragging" : ""}`}
                style={{
                  left: `${character.x}px`,
                  opacity: getSpriteOpacity(isActive, isDragging),
                  transform: `translateX(-50%) scale(${chartScale})`,
                  transformOrigin: "bottom center",
                  "--counter-scale": 1 / chartScale,
                } as React.CSSProperties}
                onMouseDown={(e) => { e.preventDefault(); startDrag(character.id, e.clientX); }}
                onTouchStart={(e) => startDrag(character.id, e.touches[0].clientX)}
                onClick={(e) => { e.stopPropagation(); setActiveCharacterId(character.id); }}
              >
                <div className={`height-chart-sprite-label${hideLabels ? " hidden" : ""}`}>
                  <span className="height-chart-sprite-name">{sprite.name}</span>
                  <span className="height-chart-sprite-height">{sprite.height}</span>
                </div>
                <img src={sprite.url} alt={sprite.name} draggable={false} />
                {isActive && (
                  <button
                    className="height-chart-sprite-close"
                    onClick={(e) => { e.stopPropagation(); toggleCharacterSelection(character.id); }}
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

      {/* Bottom selector */}
      <div className="height-chart-selector">
        <div className="height-chart-selector-inner">
          {spriteGroups.map((group) => (
            <div key={group.groupId} className="height-chart-selector-group" data-group-id={group.groupId}>
              <ButtonWrapper
                className={`height-chart-selector-item${isGroupSelected(group) ? " selected" : ""}${expandedGroupId === group.groupId ? " expanded" : ""}`}
                onClick={() => {
                  const el = document.querySelector(`[data-group-id="${group.groupId}"]`) as HTMLDivElement | null;
                  if (el) handleGroupClick(group, el);
                }}
                soundFile={selectorSound}
              >
                <img src={group.thumbnail} alt={group.name} draggable={false} />
                <span className="height-chart-selector-item-name">{group.name}</span>
              </ButtonWrapper>
            </div>
          ))}
        </div>
      </div>

      {/* Variant popup (portal) */}
      {expandedGroup && expandedGroup.variants.length > 1 && popupPosition &&
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
                soundFile={variantSoundFile}
              >
                <img src={sprite.thumbnail} alt={expandedGroup.name} draggable={false} />
              </ButtonWrapper>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
