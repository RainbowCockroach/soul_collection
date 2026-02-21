import React, { useState, useEffect } from "react";
import type { HeightChartGroup, HeightChartSprite } from "../helpers/objects";
import { loadHeightChartGroups, loadOCs } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./EditorCommon.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";

interface SortableGroupItemProps {
  group: HeightChartGroup;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
}

const SortableGroupItem: React.FC<SortableGroupItemProps> = ({
  group,
  index,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.groupId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`editor-item ${isSelected ? "editor-item-selected" : ""}`}
      onClick={() => onSelect(index)}
    >
      <div {...attributes} {...listeners} className="editor-drag-handle">
        ⋮⋮
      </div>
      <div className="editor-item-content">
        <div className="editor-item-name">{group.name}</div>
        <div className="editor-item-slug">
          {group.variants.length} variant{group.variants.length !== 1 && "s"}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
        className="editor-button editor-button-danger editor-button-small"
      >
        🗑
      </button>
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
  const [groups, setGroups] = useState<HeightChartGroup[]>([]);
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
  const [dragMode, setDragMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loaded, ocs] = await Promise.all([
        loadHeightChartGroups(),
        loadOCs(),
      ]);
      setGroups(loaded.map((g, index) => ({ ...g, order: g.order ?? index })));
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = groups.findIndex((g) => g.groupId === active.id);
      const newIndex = groups.findIndex((g) => g.groupId === over.id);

      const newGroups = arrayMove(groups, oldIndex, newIndex).map(
        (g, index) => ({ ...g, order: index }),
      );
      setGroups(newGroups);

      if (selectedGroupIndex === oldIndex) {
        setSelectedGroupIndex(newIndex);
      } else if (
        selectedGroupIndex !== null &&
        selectedGroupIndex >= Math.min(oldIndex, newIndex) &&
        selectedGroupIndex <= Math.max(oldIndex, newIndex)
      ) {
        setSelectedGroupIndex(
          oldIndex > newIndex
            ? selectedGroupIndex + 1
            : selectedGroupIndex - 1,
        );
      }

      toast.success("Groups reordered! Use 'Copy to clipboard' to export.");
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(groups, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Height chart JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
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
        <h2>Height Chart Editor</h2>
        <div className="editor-button-group">
          <button
            onClick={() => setDragMode(!dragMode)}
            className={`editor-button editor-button-secondary ${dragMode ? "active" : ""}`}
          >
            {dragMode ? "Exit Drag Mode" : "Rearrange Groups"}
          </button>
          <button
            onClick={handleSaveToClipboard}
            className="editor-button editor-button-success"
          >
            Copy to clipboard
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Groups ({groups.length})</h3>
            </div>
            {dragMode && <p>Drag the ⋮⋮ handle to reorder groups</p>}
            {dragMode ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={groups.map((g) => g.groupId)}
                  strategy={verticalListSortingStrategy}
                >
                  {groups.map((group, index) => (
                    <SortableGroupItem
                      key={group.groupId}
                      group={group}
                      index={index}
                      isSelected={selectedGroupIndex === index}
                      onSelect={handleSelectGroup}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              groups.map((group, index) => (
                <div
                  key={group.groupId}
                  className={`editor-item ${selectedGroupIndex === index ? "editor-item-selected" : ""}`}
                  onClick={() => handleSelectGroup(index)}
                >
                  <div className="editor-item-content">
                    <div className="editor-item-name">{group.name}</div>
                    <div className="editor-item-slug">
                      {group.variants.length} variant{group.variants.length !== 1 && "s"}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="editor-button editor-button-danger editor-button-small"
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
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
                    <button
                      onClick={() => handleRemoveVariant(index)}
                      className="editor-button editor-button-danger editor-button-small"
                    >
                      Remove
                    </button>
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
                          handleVariantChange(index, "thumbnail", e.target.value)
                        }
                        placeholder="https://..."
                        className="editor-input"
                        style={{ fontSize: "13px" }}
                      />
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
                {isEditing ? "Update" : "Add"} Group
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
