import React, { useState, useEffect } from "react";
import type { Group } from "../helpers/objects";
import { loadGroups } from "../helpers/data-load";
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

interface GroupJsonData {
  [key: string]: Omit<Group, "slug">;
}

interface SortableGroupItemProps {
  group: Group;
  isSelected: boolean;
  onSelect: (slug: string) => void;
  onDelete: (slug: string) => void;
}

const SortableGroupItem: React.FC<SortableGroupItemProps> = ({
  group,
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
  } = useSortable({ id: group.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`editor-item ${
        isSelected ? "editor-item-selected" : ""
      }`}
    >
      <div className="editor-drag-handle" {...listeners}>
        ⋮⋮
      </div>
      <div
        onClick={() => onSelect(group.slug)}
        className="editor-item-content"
      >
        <div
          className="editor-color-box"
          style={{ backgroundColor: group.frameColour }}
        />
        <span>
          <strong>{group.name}</strong> ({group.slug})
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(group.slug);
        }}
        className="editor-button editor-button-danger editor-button-small"
      >
        Delete
      </button>
    </div>
  );
};

export const EditorGroup: React.FC = () => {
  const [groupData, setGroupData] = useState<GroupJsonData>({});
  const [groupsArray, setGroupsArray] = useState<Group[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [editingItem, setEditingItem] = useState<Group | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragMode, setDragMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadGroupData();
  }, []);

  const loadGroupData = async () => {
    try {
      const groupsArray = await loadGroups();
      const data: GroupJsonData = {};
      groupsArray.forEach((group, index) => {
        const { slug, ...rest } = group;
        data[slug] = { ...rest, order: rest.order ?? index };
      });
      setGroupData(data);
      setGroupsArray(
        groupsArray.map((group, index) => ({
          ...group,
          order: group.order ?? index,
        }))
      );
    } catch (error) {
      console.error("Error loading group data:", error);
    }
  };

  const handleSelectItem = (slug: string) => {
    setSelectedSlug(slug);
    const group = groupData[slug];
    setEditingItem({
      ...group,
      slug,
      // Provide defaults for backward compatibility
      groupHeaderColour: group.groupHeaderColour || "#ffffff",
      groupHeaderTextColour: group.groupHeaderTextColour || "#000000",
    });
    setIsEditing(true);
  };

  const isNewItem = () => {
    return editingItem && !groupData[editingItem.slug];
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = groupsArray.findIndex(
        (group) => group.slug === active.id
      );
      const newIndex = groupsArray.findIndex(
        (group) => group.slug === over?.id
      );

      const newGroupsArray = arrayMove(groupsArray, oldIndex, newIndex);

      const updatedGroupsArray = newGroupsArray.map((group, index) => ({
        ...group,
        order: index,
      }));

      setGroupsArray(updatedGroupsArray);

      const updatedData: GroupJsonData = {};
      updatedGroupsArray.forEach((group) => {
        const { slug, ...rest } = group;
        updatedData[slug] = rest;
      });
      setGroupData(updatedData);

      toast.success("Groups reordered! Use 'Copy to clipboard' to export.");
    }
  };

  const handleSave = () => {
    if (!editingItem) return;

    const updatedData = { ...groupData };
    const { slug, ...itemData } = editingItem;
    updatedData[slug] = itemData;

    const updatedGroupsArray = groupsArray.map((group) =>
      group.slug === slug ? editingItem : group
    );
    if (!groupsArray.find((g) => g.slug === slug)) {
      updatedGroupsArray.push(editingItem);
    }

    setGroupData(updatedData);
    setGroupsArray(updatedGroupsArray);
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
    toast.success("Group updated! Use 'Copy to clipboard' to export.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
  };

  const handleAddNew = () => {
    const groupName = prompt("Enter name for new group:");
    if (groupName) {
      const newSlug = slugify(groupName, { lower: true, strict: true });
      if (!groupData[newSlug]) {
        setEditingItem({
          slug: newSlug,
          name: groupName,
          frameColour: "#000000",
          groupHeaderColour: "#ffffff",
          groupHeaderTextColour: "#000000",
          order: groupsArray.length,
        });
        setSelectedSlug(newSlug);
        setIsEditing(true);
      } else {
        toast.error("A group with this name already exists!");
      }
    }
  };

  const handleDelete = (slug: string) => {
    if (
      confirm(
        `Are you sure you want to delete group "${groupData[slug].name}"?`
      )
    ) {
      const updatedData = { ...groupData };
      delete updatedData[slug];

      const updatedGroupsArray = groupsArray.filter(
        (group) => group.slug !== slug
      );

      setGroupData(updatedData);
      setGroupsArray(updatedGroupsArray);
      if (selectedSlug === slug) {
        setIsEditing(false);
        setEditingItem(null);
        setSelectedSlug("");
      }
      toast.success("Group deleted! Use 'Copy to clipboard' to export.");
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(groupData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Group JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Error copying to clipboard");
    }
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>Group Editor</h2>
        <div className="editor-button-group">
          <button
            onClick={handleSaveToClipboard}
            className="editor-button editor-button-success"
          >
            Copy to clipboard
          </button>
        </div>
      </div>

      <div className="editor-button-group">
        <button onClick={handleAddNew} className="editor-button editor-button-primary">
          Add New Group
        </button>
        <button
          onClick={() => setDragMode(!dragMode)}
          className={`editor-button editor-button-secondary ${dragMode ? "active" : ""}`}
        >
          {dragMode ? "Exit Drag Mode" : "Rearrange Groups"}
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Group List</h3>
            </div>
          {dragMode && <p>Drag the ⋮⋮ handle to reorder items</p>}
          {dragMode ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={groupsArray.map((group) => group.slug)}
                strategy={verticalListSortingStrategy}
              >
                <div className="editor-list">
                  {groupsArray.map((group) => (
                    <SortableGroupItem
                      key={group.slug}
                      group={group}
                      isSelected={selectedSlug === group.slug}
                      onSelect={handleSelectItem}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="editor-list">
              {groupsArray.map((group) => (
                <div
                  key={group.slug}
                  className={`editor-item ${
                    selectedSlug === group.slug
                      ? "editor-item-selected"
                      : ""
                  }`}
                >
                  <div
                    onClick={() => handleSelectItem(group.slug)}
                    className="editor-item-content"
                  >
                    <div
                      className="editor-color-box"
                      style={{ backgroundColor: group.frameColour }}
                    />
                    <span>
                      <strong>{group.name}</strong> ({group.slug})
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(group.slug);
                    }}
                    className="editor-button editor-button-danger editor-button-small"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        {isEditing && editingItem && (
          <div className="editor-right">
            <div className="editor-form">
              <div className="editor-field">
                <label className="editor-label">URL Name:</label>
                <input
                  type="text"
                  value={editingItem.slug}
                  onChange={(e) => {
                    if (isNewItem()) {
                      setEditingItem({
                        ...editingItem,
                        slug: slugify(e.target.value, {
                          lower: true,
                          strict: true,
                        }),
                      });
                    }
                  }}
                  className="editor-input"
                  disabled={!isNewItem()}
                  style={{
                    backgroundColor: !isNewItem() ? "#f5f5f5" : "white",
                    cursor: !isNewItem() ? "not-allowed" : "text",
                  }}
                />
                {!isNewItem() && (
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    URL names cannot be changed for existing groups to prevent
                    data corruption
                  </small>
                )}
              </div>

              <div className="editor-field">
                <label className="editor-label">Name:</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    if (isNewItem()) {
                      const newSlug = slugify(newName, {
                        lower: true,
                        strict: true,
                      });
                      setEditingItem({
                        ...editingItem,
                        name: newName,
                        slug: newSlug,
                      });
                    } else {
                      setEditingItem({ ...editingItem, name: newName });
                    }
                  }}
                  className="editor-input"
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Frame Colour:</label>
                <div className="editor-color-group">
                  <input
                    type="color"
                    value={editingItem.frameColour}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        frameColour: e.target.value,
                      })
                    }
                    className="editor-color-picker"
                  />
                  <input
                    type="text"
                    value={editingItem.frameColour}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        frameColour: e.target.value,
                      })
                    }
                    className="editor-color-text"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="editor-field">
                <label className="editor-label">
                  Header Background Colour:
                </label>
                <div className="editor-color-group">
                  <input
                    type="color"
                    value={editingItem.groupHeaderColour}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        groupHeaderColour: e.target.value,
                      })
                    }
                    className="editor-color-picker"
                  />
                  <input
                    type="text"
                    value={editingItem.groupHeaderColour}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        groupHeaderColour: e.target.value,
                      })
                    }
                    className="editor-color-text"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="editor-field">
                <label className="editor-label">
                  Header Text Colour:
                </label>
                <div className="editor-color-group">
                  <input
                    type="color"
                    value={editingItem.groupHeaderTextColour}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        groupHeaderTextColour: e.target.value,
                      })
                    }
                    className="editor-color-picker"
                  />
                  <input
                    type="text"
                    value={editingItem.groupHeaderTextColour}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        groupHeaderTextColour: e.target.value,
                      })
                    }
                    className="editor-color-text"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="editor-button-group">
                <button
                  onClick={handleSave}
                  className="editor-button editor-button-success"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="editor-button editor-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
