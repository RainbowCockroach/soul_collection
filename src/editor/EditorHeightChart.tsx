import React, { useState, useEffect } from "react";
import type { HeightChartGroup, HeightChartSprite } from "../helpers/objects";
import { loadHeightChartGroups } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import slugify from "slugify";
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
  } = useSortable({ id: `hcgroup-${index}` });

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
  filename: "",
  height: "",
});

// Generate variant ID from filename
const generateVariantId = (filename: string): string => {
  if (!filename) return "";

  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

  // Convert to slug format using slugify
  return slugify(nameWithoutExt, { lower: true, strict: true });
};

export const EditorHeightChart: React.FC = () => {
  const [groups, setGroups] = useState<HeightChartGroup[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(
    null,
  );
  const [formData, setFormData] = useState<{
    name: string;
    variants: HeightChartSprite[];
  }>({
    name: "",
    variants: [emptyVariant()],
  });
  const [isEditing, setIsEditing] = useState(false);

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
      const loaded = await loadHeightChartGroups();
      setGroups(loaded);
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

    // Auto-generate groupId from name
    const groupId = slugify(formData.name, { lower: true, strict: true });

    if (!groupId) {
      toast.error(
        "Group name must contain at least one alphanumeric character",
      );
      return;
    }

    // Filter out empty variants and auto-generate IDs
    const validVariants = formData.variants
      .filter((v) => v.filename.trim() && v.height.trim())
      .map((v) => ({
        ...v,
        id: generateVariantId(v.filename),
      }));

    if (validVariants.length === 0) {
      toast.error(
        "At least one complete variant is required (filename and height)",
      );
      return;
    }

    const newGroup: HeightChartGroup = {
      name: formData.name,
      groupId: groupId,
      variants: validVariants,
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
    setFormData({
      name: "",
      variants: [emptyVariant()],
    });
    setIsEditing(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = parseInt(active.id.toString().split("-")[1]);
      const overIndex = parseInt(over.id.toString().split("-")[1]);

      const newGroups = arrayMove(groups, activeIndex, overIndex);
      setGroups(newGroups);

      if (selectedGroupIndex === activeIndex) {
        setSelectedGroupIndex(overIndex);
      } else if (selectedGroupIndex === overIndex) {
        setSelectedGroupIndex(
          activeIndex > overIndex
            ? selectedGroupIndex + 1
            : selectedGroupIndex - 1,
        );
      }
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
        <button
          onClick={handleSaveToClipboard}
          className="editor-button editor-button-success"
        >
          Copy to clipboard
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Groups ({groups.length})</h3>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={groups.map((_, index) => `hcgroup-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                {groups.map((group, index) => (
                  <SortableGroupItem
                    key={`hcgroup-${index}`}
                    group={group}
                    index={index}
                    isSelected={selectedGroupIndex === index}
                    onSelect={handleSelectGroup}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--editor-gray-500)",
                  marginTop: "4px",
                }}
              >
                ID will be auto-generated:{" "}
                {slugify(formData.name, { lower: true, strict: true }) ||
                  "(empty)"}
              </div>
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
                        Filename:
                      </label>
                      <input
                        type="text"
                        value={variant.filename}
                        onChange={(e) =>
                          handleVariantChange(index, "filename", e.target.value)
                        }
                        placeholder="e.g. height_chart_sam_regular.webp"
                        className="editor-input"
                        style={{ fontSize: "13px" }}
                      />
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--editor-gray-500)",
                          marginTop: "2px",
                        }}
                      >
                        ID will be:{" "}
                        {generateVariantId(variant.filename) || "(empty)"}
                      </div>
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
