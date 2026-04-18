import React, { useState, useEffect, useCallback } from "react";
import type {
  HeightChartGroup,
  HeightChartSprite,
  HeightChartMode,
} from "../helpers/objects";
import {
  loadHeightChartGroups,
  loadGodlyHeightChartGroups,
  loadOCs,
} from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import SavePushButton from "./SavePushButton";
import CopyToClipboardButton from "./CopyToClipboardButton";
import ReorderButtons from "./ReorderButtons";
import DeleteButton from "./DeleteButton";
import "./EditorCommon.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";
import ImagePreview from "./ImagePreview";

const TAB_LABELS: Record<HeightChartMode, string> = {
  mortal: "Birth Forms",
  godly: "God Forms",
};

const FILE_NAMES: Record<HeightChartMode, string> = {
  mortal: "height-chart.json",
  godly: "height-chart-godly.json",
};

interface GroupItemProps {
  group: HeightChartGroup;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  index,
  total,
  isSelected,
  onSelect,
  onDelete,
  onMove,
}) => {
  return (
    <div
      className={`editor-item ${isSelected ? "editor-item-selected" : ""}`}
      onClick={() => onSelect(index)}
    >
      <ReorderButtons index={index} total={total} onMove={onMove} />
      <div className="editor-item-content">
        <div className="editor-item-name">{group.name}</div>
        <div className="editor-item-slug">
          {group.variants.length} variant{group.variants.length !== 1 && "s"}
        </div>
      </div>
      <span onClick={(e) => e.stopPropagation()}>
        <DeleteButton onClick={() => onDelete(index)} title="Delete group" />
      </span>
    </div>
  );
};

const emptyVariant = (): HeightChartSprite => ({
  id: "",
  url: "",
  thumbnail: "",
  height: "",
});

const emptyGroup = () => ({
  name: "",
  groupId: "",
  thumbnail: "",
  variants: [emptyVariant()],
});

export const EditorHeightChart: React.FC = () => {
  const [mode, setMode] = useState<HeightChartMode>("mortal");
  const [mortalGroups, setMortalGroups] = useState<HeightChartGroup[]>([]);
  const [godlyGroups, setGodlyGroups] = useState<HeightChartGroup[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(
    null,
  );
  const [ocOptions, setOcOptions] = useState<{ slug: string; name: string }[]>(
    [],
  );
  const [formData, setFormData] = useState<{
    name: string;
    groupId: string;
    thumbnail: string;
    variants: HeightChartSprite[];
  }>(emptyGroup());
  const [isEditing, setIsEditing] = useState(false);

  const groups = mode === "mortal" ? mortalGroups : godlyGroups;
  const setGroups = mode === "mortal" ? setMortalGroups : setGodlyGroups;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mortal, godly, ocs] = await Promise.all([
        loadHeightChartGroups(),
        loadGodlyHeightChartGroups(),
        loadOCs(),
      ]);
      setMortalGroups(
        mortal.map((g, index) => ({ ...g, order: g.order ?? index })),
      );
      setGodlyGroups(
        godly.map((g, index) => ({ ...g, order: g.order ?? index })),
      );
      setOcOptions(
        ocs
          .map((oc) => ({ slug: oc.slug, name: oc.name }))
          .sort((a, b) => a.slug.localeCompare(b.slug)),
      );
    } catch (error) {
      console.error("Error loading height chart data:", error);
      toast.error("Failed to load height chart data");
    }
  };

  const handleModeSwitch = useCallback(
    (newMode: HeightChartMode) => {
      if (newMode === mode) return;
      // Reset editing state when switching tabs
      setSelectedGroupIndex(null);
      setFormData(emptyGroup());
      setIsEditing(false);
      setMode(newMode);
    },
    [mode],
  );

  const handleSelectGroup = (index: number) => {
    const group = groups[index];
    if (group) {
      setSelectedGroupIndex(index);
      setFormData({
        name: group.name,
        groupId: group.groupId,
        thumbnail: group.thumbnail,
        variants: group.variants.map((v) => ({ ...v })),
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    const groupId = formData.groupId;

    if (!groupId) {
      toast.error("Please select an OC slug for the Group ID");
      return;
    }

    // Filter out empty variants
    const validVariants = formData.variants.filter(
      (v) => v.url.trim() && v.height.trim(),
    );

    if (validVariants.length === 0) {
      toast.error("At least one complete variant is required (URL and height)");
      return;
    }

    // Auto-generate IDs based on groupId and position
    const variantsWithIds = validVariants.map((v, idx) => ({
      ...v,
      id: `${groupId}-${idx + 1}`,
    }));

    const newGroup: HeightChartGroup = {
      name: formData.name,
      groupId: groupId,
      thumbnail: formData.thumbnail,
      variants: variantsWithIds,
      order:
        isEditing && selectedGroupIndex !== null
          ? groups[selectedGroupIndex].order
          : groups.length,
    };

    let updatedGroups: HeightChartGroup[];
    if (isEditing && selectedGroupIndex !== null) {
      updatedGroups = groups.map((g, idx) =>
        idx === selectedGroupIndex ? newGroup : g,
      );
    } else {
      updatedGroups = [...groups, newGroup];
    }

    setGroups(updatedGroups);
    toast.success(isEditing ? "Group updated" : "Group created");
    handleCancelEdit();
  };

  const handleDelete = (index: number) => {
    if (
      window.confirm("Are you sure you want to delete this height chart group?")
    ) {
      const updatedGroups = groups.filter((_, idx) => idx !== index);
      setGroups(updatedGroups);

      if (selectedGroupIndex === index) {
        handleCancelEdit();
      } else if (selectedGroupIndex !== null && selectedGroupIndex > index) {
        setSelectedGroupIndex(selectedGroupIndex - 1);
      }
      toast.success("Group deleted");
    }
  };

  const handleCancelEdit = () => {
    setSelectedGroupIndex(null);
    setFormData(emptyGroup());
    setIsEditing(false);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= groups.length) return;

    const newGroups = [...groups];
    [newGroups[index], newGroups[newIndex]] = [
      newGroups[newIndex],
      newGroups[index],
    ];
    const updatedGroups = newGroups.map((g, idx) => ({ ...g, order: idx }));
    setGroups(updatedGroups);

    if (selectedGroupIndex === index) {
      setSelectedGroupIndex(newIndex);
    } else if (selectedGroupIndex === newIndex) {
      setSelectedGroupIndex(index);
    }
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, emptyVariant()],
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (formData.variants.length <= 1) {
      toast.error("At least one variant is required");
      return;
    }
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, idx) => idx !== index),
    });
  };

  const handleVariantChange = (
    index: number,
    field: keyof HeightChartSprite,
    value: string,
  ) => {
    const updatedVariants = formData.variants.map((v, idx) =>
      idx === index ? { ...v, [field]: value } : v,
    );
    setFormData({ ...formData, variants: updatedVariants });
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <div className="editor-button-group">
          {(["mortal", "godly"] as HeightChartMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              className={`editor-button ${mode === m ? "editor-button-primary" : "editor-button-secondary"}`}
            >
              {TAB_LABELS[m]}
            </button>
          ))}
          <SavePushButton
            fileId={mode === "mortal" ? "height-chart" : "height-chart-godly"}
            getData={() => groups}
          />
          <CopyToClipboardButton
            getData={() => groups}
            label={`Copy to clipboard (${FILE_NAMES[mode]})`}
            entityLabel={FILE_NAMES[mode]}
          />
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>
                {TAB_LABELS[mode]} ({groups.length})
              </h3>
            </div>
            {groups.map((group, index) => (
              <GroupItem
                key={group.groupId}
                group={group}
                index={index}
                total={groups.length}
                isSelected={selectedGroupIndex === index}
                onSelect={handleSelectGroup}
                onDelete={handleDelete}
                onMove={handleMove}
              />
            ))}
          </div>
        </div>

        <div className="editor-right">
          <div className="editor-form">
            <h3>{isEditing ? "Edit Group" : "Add New Group"}</h3>

            <div className="editor-field">
              <label className="editor-label">Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Sam"
                className="editor-input"
              />
            </div>

            <div className="editor-field">
              <label className="editor-label">OC:</label>
              <select
                value={formData.groupId}
                onChange={(e) =>
                  setFormData({ ...formData, groupId: e.target.value })
                }
                className="editor-input"
              >
                <option value="">— select an OC —</option>
                {ocOptions.map((oc) => (
                  <option key={oc.slug} value={oc.slug}>
                    {oc.slug} (<BBCodeDisplay bbcode={oc.name} />)
                  </option>
                ))}
              </select>
            </div>

            <div className="editor-field">
              <label className="editor-label">Group Thumbnail URL:</label>
              <input
                type="text"
                value={formData.thumbnail}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail: e.target.value })
                }
                placeholder="https://..."
                className="editor-input"
              />
              <ImagePreview urls={[formData.thumbnail]} />
            </div>

            <div className="editor-field">
              <label className="editor-label">Variants:</label>
              {formData.variants.map((variant, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px",
                    background: "white",
                    borderRadius: "4px",
                    marginBottom: "8px",
                    border: "1px solid var(--editor-gray-200)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "13px",
                        color: "var(--editor-gray-600)",
                      }}
                    >
                      Variant {index + 1}
                    </span>
                    <DeleteButton
                      onClick={() => handleRemoveVariant(index)}
                      title="Remove variant"
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <label
                        className="editor-label"
                        style={{ fontSize: "12px" }}
                      >
                        Sprite URL:
                      </label>
                      <input
                        type="text"
                        value={variant.url}
                        onChange={(e) =>
                          handleVariantChange(index, "url", e.target.value)
                        }
                        placeholder="https://..."
                        className="editor-input"
                        style={{ fontSize: "13px" }}
                      />
                      <ImagePreview urls={[variant.url]} />
                    </div>
                    <div>
                      <label
                        className="editor-label"
                        style={{ fontSize: "12px" }}
                      >
                        Thumbnail URL:
                      </label>
                      <input
                        type="text"
                        value={variant.thumbnail}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "thumbnail",
                            e.target.value,
                          )
                        }
                        placeholder="https://..."
                        className="editor-input"
                        style={{ fontSize: "13px" }}
                      />
                      <ImagePreview urls={[variant.thumbnail]} />
                    </div>
                    <div>
                      <label
                        className="editor-label"
                        style={{ fontSize: "12px" }}
                      >
                        Height:
                      </label>
                      <input
                        type="text"
                        value={variant.height}
                        onChange={(e) =>
                          handleVariantChange(index, "height", e.target.value)
                        }
                        placeholder="e.g. 1m75"
                        className="editor-input"
                        style={{ fontSize: "13px" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddVariant}
                className="editor-button editor-button-secondary editor-button-small"
                style={{ marginTop: "4px" }}
              >
                + Add Variant
              </button>
            </div>

            <div className="editor-button-group">
              <button
                onClick={handleSave}
                className="editor-button editor-button-success"
              >
                Save
              </button>
              {isEditing && (
                <button
                  onClick={handleCancelEdit}
                  className="editor-button editor-button-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorHeightChart;
