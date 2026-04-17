import React, { useState, useEffect } from "react";
import type { Group } from "../helpers/objects";
import { loadGroups } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import slugify from "slugify";
import SavePushButton from "./SavePushButton";
import ReorderButtons from "./ReorderButtons";
import DeleteButton from "./DeleteButton";
import "./EditorCommon.css";

interface GroupJsonData {
  [key: string]: Omit<Group, "slug">;
}

interface GroupItemProps {
  group: Group;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (slug: string) => void;
  onDelete: (slug: string) => void;
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
      className={`editor-item ${
        isSelected ? "editor-item-selected" : ""
      }`}
    >
      <ReorderButtons index={index} total={total} onMove={onMove} />
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
      <span onClick={(e) => e.stopPropagation()}>
        <DeleteButton onClick={() => onDelete(group.slug)} title="Delete group" />
      </span>
    </div>
  );
};

export const EditorGroup: React.FC = () => {
  const [groupData, setGroupData] = useState<GroupJsonData>({});
  const [groupsArray, setGroupsArray] = useState<Group[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [editingItem, setEditingItem] = useState<Group | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleMove = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= groupsArray.length) return;

    const newGroupsArray = [...groupsArray];
    [newGroupsArray[index], newGroupsArray[newIndex]] = [
      newGroupsArray[newIndex],
      newGroupsArray[index],
    ];

    const updatedGroupsArray = newGroupsArray.map((group, idx) => ({
      ...group,
      order: idx,
    }));

    setGroupsArray(updatedGroupsArray);

    const updatedData: GroupJsonData = {};
    updatedGroupsArray.forEach((group) => {
      const { slug, ...rest } = group;
      updatedData[slug] = rest;
    });
    setGroupData(updatedData);
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
          <SavePushButton fileId="group" getData={() => groupData} />
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
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Group List</h3>
            </div>
            <div className="editor-list">
              {groupsArray.map((group, index) => (
                <GroupItem
                  key={group.slug}
                  group={group}
                  index={index}
                  total={groupsArray.length}
                  isSelected={selectedSlug === group.slug}
                  onSelect={handleSelectItem}
                  onDelete={handleDelete}
                  onMove={handleMove}
                />
              ))}
            </div>
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
                  <div className="editor-color-preview-container">
                    <span className="editor-color-preview-label">Preview:</span>
                    <div
                      className="editor-color-preview-swatch"
                      style={{ backgroundColor: editingItem.frameColour }}
                    />
                  </div>
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
                  <div className="editor-color-preview-container">
                    <span className="editor-color-preview-label">Preview:</span>
                    <div
                      className="editor-color-preview-swatch"
                      style={{ backgroundColor: editingItem.groupHeaderColour }}
                    />
                  </div>
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
                  <div className="editor-color-preview-container">
                    <span className="editor-color-preview-label">Preview:</span>
                    <div
                      className="editor-color-preview-swatch"
                      style={{ backgroundColor: editingItem.groupHeaderTextColour }}
                    />
                  </div>
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
