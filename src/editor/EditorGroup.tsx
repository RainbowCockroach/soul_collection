import React, { useState, useEffect } from "react";
import type { Group } from "../helpers/objects";
import { loadGroups } from "../helpers/data-load";

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
    alert("Group updated! Use 'Save to Clipboard' to export.");
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
      alert("Group deleted! Use 'Save to Clipboard' to export.");
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
    <div style={{ padding: "20px" }}>
      <h2>Group Editor</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleAddNew} style={{ marginRight: "10px" }}>
          Add New Group
        </button>
        <button
          onClick={handleSaveToClipboard}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Save to Clipboard
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <h3>Group List</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {Object.entries(groupData).map(([slug, item]) => (
              <div
                key={slug}
                style={{
                  padding: "10px",
                  margin: "5px 0",
                  backgroundColor:
                    selectedSlug === slug ? "#e6f3ff" : "#f5f5f5",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  onClick={() => handleSelectItem(slug)}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: item.frameColour,
                      border: "1px solid #ccc",
                    }}
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
                  style={{
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {isEditing && editingItem && (
          <div style={{ flex: 1 }}>
            <h3>Edit Group</h3>
            <div style={{ border: "1px solid #ccc", padding: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Slug:
                </label>
                <input
                  type="text"
                  value={editingItem.slug}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, slug: e.target.value })
                  }
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Name:
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Frame Colour:
                </label>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <input
                    type="color"
                    value={editingItem.frameColour}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        frameColour: e.target.value,
                      })
                    }
                    style={{ width: "50px", height: "40px" }}
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
                    style={{ flex: 1, padding: "8px" }}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={handleSave}
                  style={{
                    marginRight: "10px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    cursor: "pointer",
                  }}
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
