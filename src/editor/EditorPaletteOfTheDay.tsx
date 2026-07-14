import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import palettesData from "../data/palette-of-the-day.json";
import type { DailyPalette } from "../helpers/palette-of-the-day";
import { DEFAULT_PAPER_COLOR } from "../helpers/palette-of-the-day";
import SavePushButton from "./SavePushButton";
import CopyToClipboardButton from "./CopyToClipboardButton";
import ReorderButtons from "./ReorderButtons";
import { arrayMove, trackMovedIndex } from "./reorder-utils";
import DeleteButton from "./DeleteButton";
import "./EditorCommon.css";

/** Normalize a loaded palette so paperColor always has a value. */
function normalizePalette(palette: DailyPalette): Required<DailyPalette> {
  return {
    name: palette.name,
    colors: palette.colors,
    paperColor: palette.paperColor ?? DEFAULT_PAPER_COLOR,
  };
}

interface PaletteListItemProps {
  palette: Required<DailyPalette>;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (from: number, to: number) => void;
}

const PaletteListItem: React.FC<PaletteListItemProps> = ({
  palette,
  index,
  total,
  isSelected,
  onSelect,
  onDelete,
  onMove,
}) => (
  <div
    className={`editor-item ${isSelected ? "editor-item-selected" : ""}`}
    onClick={() => onSelect(index)}
  >
    <ReorderButtons index={index} total={total} onMoveTo={onMove} />
    <div className="editor-item-content" style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        {palette.name || <span className="editor-text-muted">Untitled</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          title={`Paper: ${palette.paperColor}`}
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            border: "1px solid #ccc",
            backgroundColor: palette.paperColor,
            flexShrink: 0,
          }}
        />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {palette.colors.map((color, i) => (
            <span
              key={`${color}-${i}`}
              title={color}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "1px solid rgba(0,0,0,0.15)",
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      </div>
    </div>
    <span onClick={(e) => e.stopPropagation()}>
      <DeleteButton onClick={() => onDelete(index)} title="Delete palette" />
    </span>
  </div>
);

const EditorPaletteOfTheDay: React.FC = () => {
  const [palettes, setPalettes] = useState<Required<DailyPalette>[]>(() =>
    (palettesData as DailyPalette[]).map(normalizePalette),
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Working copy of the selected palette. Edits stay here until "Save" commits
  // them into the palettes list, so the user can revise before saving.
  const [draft, setDraft] = useState<Required<DailyPalette> | null>(null);

  const selected = draft;

  const handleSelectPalette = (index: number) => {
    setSelectedIndex(index);
    setDraft({ ...palettes[index], colors: [...palettes[index].colors] });
  };

  const handleCancelEdit = () => {
    setSelectedIndex(null);
    setDraft(null);
  };

  /** Commit the draft into the palettes list (does not push to file). */
  const handleSavePalette = () => {
    if (selectedIndex === null || !draft) return;
    if (!draft.name.trim()) {
      toast.error("Palette name cannot be empty");
      return;
    }
    setPalettes((prev) =>
      prev.map((p, i) => (i === selectedIndex ? draft : p)),
    );
    toast.success("Palette saved");
  };

  /** Apply a change to the draft of the currently selected palette. */
  const updateSelected = (patch: Partial<Required<DailyPalette>>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleAddPalette = () => {
    const newPalette: Required<DailyPalette> = {
      name: "New Palette",
      colors: ["#000000"],
      paperColor: DEFAULT_PAPER_COLOR,
    };
    const newIndex = palettes.length;
    setPalettes((prev) => [...prev, newPalette]);
    setSelectedIndex(newIndex);
    setDraft({ ...newPalette, colors: [...newPalette.colors] });
    toast.success("Palette added");
  };

  const handleDeletePalette = (index: number) => {
    if (!window.confirm("Are you sure you want to delete this palette?")) return;
    setPalettes((prev) => prev.filter((_, i) => i !== index));
    if (selectedIndex === index) {
      handleCancelEdit();
    } else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
    toast.success("Palette deleted");
  };

  const handleMovePalette = (from: number, to: number) => {
    const moved = arrayMove(palettes, from, to);
    if (moved === palettes) return;
    setPalettes(moved);
    setSelectedIndex(trackMovedIndex(selectedIndex, from, to));
  };

  // --- Color editing within the selected palette draft ---

  const handleColorChange = (colorIndex: number, value: string) => {
    if (!selected) return;
    updateSelected({
      colors: selected.colors.map((c, i) => (i === colorIndex ? value : c)),
    });
  };

  const handleAddColor = () => {
    if (!selected) return;
    updateSelected({ colors: [...selected.colors, "#000000"] });
  };

  const handleDeleteColor = (colorIndex: number) => {
    if (!selected) return;
    if (selected.colors.length <= 1) {
      toast.error("A palette needs at least one color");
      return;
    }
    updateSelected({
      colors: selected.colors.filter((_, i) => i !== colorIndex),
    });
  };

  const handleMoveColor = (from: number, to: number) => {
    if (!selected) return;
    const moved = arrayMove(selected.colors, from, to);
    if (moved === selected.colors) return;
    updateSelected({ colors: moved });
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <div className="editor-button-group">
          <SavePushButton
            fileId="palette-of-the-day"
            getData={() => palettes}
          />
          <CopyToClipboardButton
            getData={() => palettes}
            entityLabel="Palette of the Day JSON"
          />
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Palettes ({palettes.length})</h3>
              <button
                onClick={handleAddPalette}
                className="editor-button editor-button-success"
              >
                + Add Palette
              </button>
            </div>
            {palettes.length > 0 ? (
              palettes.map((palette, index) => (
                <PaletteListItem
                  key={`palette-${index}`}
                  palette={palette}
                  index={index}
                  total={palettes.length}
                  isSelected={selectedIndex === index}
                  onSelect={handleSelectPalette}
                  onDelete={handleDeletePalette}
                  onMove={handleMovePalette}
                />
              ))
            ) : (
              <div className="editor-empty-state">No palettes yet</div>
            )}
          </div>
        </div>

        <div className="editor-right">
          {selected ? (
            <div className="editor-form">
              <h3>Edit Palette</h3>

              <div className="editor-field">
                <label className="editor-label">Name:</label>
                <input
                  type="text"
                  value={selected.name}
                  onChange={(e) => updateSelected({ name: e.target.value })}
                  placeholder="Palette name"
                  className="editor-input"
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Paper Color (canvas background):</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="color"
                    value={selected.paperColor}
                    onChange={(e) =>
                      updateSelected({ paperColor: e.target.value })
                    }
                    aria-label="Paper color"
                    style={{ width: 44, height: 32, padding: 0 }}
                  />
                  <input
                    type="text"
                    value={selected.paperColor}
                    onChange={(e) =>
                      updateSelected({ paperColor: e.target.value })
                    }
                    placeholder="#ffffff"
                    className="editor-input"
                    style={{ maxWidth: 140 }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateSelected({ paperColor: DEFAULT_PAPER_COLOR })
                    }
                    className="editor-button editor-button-secondary"
                  >
                    Reset to white
                  </button>
                </div>
              </div>

              <div className="editor-field">
                <label className="editor-label">
                  Pen Colors ({selected.colors.length}):
                </label>
                <div className="editor-list">
                  {selected.colors.map((color, colorIndex) => (
                    <div
                      key={`color-${colorIndex}`}
                      className="editor-item"
                      style={{ alignItems: "center" }}
                    >
                      <ReorderButtons
                        index={colorIndex}
                        total={selected.colors.length}
                        onMoveTo={handleMoveColor}
                      />
                      <div
                        className="editor-item-content"
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <input
                          type="color"
                          value={color}
                          onChange={(e) =>
                            handleColorChange(colorIndex, e.target.value)
                          }
                          aria-label={`Pen color ${colorIndex + 1}`}
                          style={{ width: 44, height: 32, padding: 0 }}
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) =>
                            handleColorChange(colorIndex, e.target.value)
                          }
                          placeholder="#000000"
                          className="editor-input"
                          style={{ maxWidth: 140 }}
                        />
                        {colorIndex === 0 && (
                          <span className="editor-text-muted">
                            (default pen)
                          </span>
                        )}
                      </div>
                      <DeleteButton
                        onClick={() => handleDeleteColor(colorIndex)}
                        title="Delete color"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddColor}
                  className="editor-button editor-button-success"
                  style={{ marginTop: 8 }}
                >
                  + Add Color
                </button>
              </div>

              <div className="editor-button-group">
                <button
                  onClick={handleSavePalette}
                  className="editor-button editor-button-success"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="editor-button editor-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="editor-empty-state">
              Select a palette to edit, or add a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPaletteOfTheDay;
