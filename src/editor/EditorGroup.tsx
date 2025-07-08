import React, { useState, useEffect } from "react";
import type { Group } from "../helpers/objects";
import { loadGroups } from "../helpers/data-load";
import "./EditorGroup.css";

interface GroupJsonData {
  [key: string]: Omit<Group, "slug">;
}

export const EditorGroup: React.FC = () => {
  const [groupData, setGroupData] = useState<GroupJsonData>({});
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
      groupsArray.forEach((group) => {
        const { slug, ...rest } = group;
        data[slug] = rest;
      });
      setGroupData(data);
    } catch (error) {
      console.error("Error loading group data:", error);
    }
  };

  const handleSelectItem = (slug: string) => {
    setSelectedSlug(slug);
    setEditingItem({ ...groupData[slug], slug });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingItem) return;

    const updatedData = { ...groupData };
    const { slug, ...itemData } = editingItem;
    updatedData[slug] = itemData;

    setGroupData(updatedData);
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
    alert("Group updated! Use 'Copy to clipboard' to export.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
  };

  const handleAddNew = () => {
    const newSlug = prompt("Enter url name for new group:");
    if (newSlug && !groupData[newSlug]) {
      setEditingItem({
        slug: newSlug,
        name: "",
        frameColour: "#000000",
      });
      setSelectedSlug(newSlug);
      setIsEditing(true);
    } else if (newSlug && groupData[newSlug]) {
      alert("Group with this slug already exists!");
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

      setGroupData(updatedData);
      if (selectedSlug === slug) {
        setIsEditing(false);
        setEditingItem(null);
        setSelectedSlug("");
      }
      alert("Group deleted! Use 'Copy to clipboard' to export.");
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(groupData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      alert("Group JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Error copying to clipboard");
    }
  };

  return (
    <div className="editor-group-container">
      <h2>Group Editor</h2>

      <div className="editor-group-buttons">
        <button onClick={handleAddNew} className="editor-group-button">
          Add New Group
        </button>
        <button
          onClick={handleSaveToClipboard}
          className="editor-group-save-button"
        >
          Copy to clipboard
        </button>
      </div>

      <div className="editor-group-layout">
        <div className="editor-group-left">
          <h3>Group List</h3>
          <div className="editor-group-list">
            {Object.entries(groupData).map(([slug, item]) => (
              <div
                key={slug}
                className={`editor-group-item ${
                  selectedSlug === slug
                    ? "editor-group-item-selected"
                    : "editor-group-item-default"
                }`}
              >
                <div
                  onClick={() => handleSelectItem(slug)}
                  className="editor-group-item-content"
                >
                  <div
                    className="editor-group-color-box"
                    style={{ backgroundColor: item.frameColour }}
                  />
                  <span>
                    <strong>{item.name}</strong> ({slug})
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(slug);
                  }}
                  className="editor-group-delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {isEditing && editingItem && (
          <div className="editor-group-right">
            <h3>Edit Group</h3>
            <div className="editor-group-form">
              <div className="editor-group-field">
                <label className="editor-group-label">Url name:</label>
                <input
                  type="text"
                  value={editingItem.slug}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, slug: e.target.value })
                  }
                  className="editor-group-input"
                />
              </div>

              <div className="editor-group-field">
                <label className="editor-group-label">Name:</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="editor-group-input"
                />
              </div>

              <div className="editor-group-field">
                <label className="editor-group-label">Frame Colour:</label>
                <div className="editor-group-color-inputs">
                  <input
                    type="color"
                    value={editingItem.frameColour}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        frameColour: e.target.value,
                      })
                    }
                    className="editor-group-color-picker"
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
                    className="editor-group-color-text"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="editor-group-form-buttons">
                <button
                  onClick={handleSave}
                  className="editor-group-save-form-button"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="editor-group-cancel-button"
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
