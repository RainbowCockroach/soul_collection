import React, { useState, useEffect } from "react";
import type { Spieces } from "../helpers/objects";
import { loadSpecies } from "../helpers/data-load";

interface SpiecesJsonData {
  [key: string]: Omit<Spieces, "slug">;
}

export const EditorSpieces: React.FC = () => {
  const [spiecesData, setSpiecesData] = useState<SpiecesJsonData>({});
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [editingItem, setEditingItem] = useState<Spieces | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadSpiecesData();
  }, []);

  const loadSpiecesData = async () => {
    try {
      const speciesArray = await loadSpecies();
      const data: SpiecesJsonData = {};
      speciesArray.forEach((species) => {
        const { slug, ...rest } = species;
        data[slug] = rest;
      });
      setSpiecesData(data);
    } catch (error) {
      console.error("Error loading species data:", error);
    }
  };

  const handleSelectItem = (slug: string) => {
    setSelectedSlug(slug);
    setEditingItem({ ...spiecesData[slug], slug });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingItem) return;

    const updatedData = { ...spiecesData };
    const { slug, ...itemData } = editingItem;
    updatedData[slug] = itemData;

    setSpiecesData(updatedData);
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
    alert("Species updated! Use 'Save to Clipboard' to export.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
  };

  const handleAddNew = () => {
    const newSlug = prompt("Enter url name for new species:");
    if (newSlug && !spiecesData[newSlug]) {
      setEditingItem({
        slug: newSlug,
        name: "",
        description: "",
      });
      setSelectedSlug(newSlug);
      setIsEditing(true);
    } else if (newSlug && spiecesData[newSlug]) {
      alert("Species with this slug already exists!");
    }
  };

  const handleDelete = (slug: string) => {
    if (
      confirm(
        `Are you sure you want to delete species "${spiecesData[slug].name}"?`
      )
    ) {
      const updatedData = { ...spiecesData };
      delete updatedData[slug];

      setSpiecesData(updatedData);
      if (selectedSlug === slug) {
        setIsEditing(false);
        setEditingItem(null);
        setSelectedSlug("");
      }
      alert("Species deleted! Use 'Save to Clipboard' to export.");
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(spiecesData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      alert("Species JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Error copying to clipboard");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Species Editor</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleAddNew} style={{ marginRight: "10px" }}>
          Add New Species
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
          <h3>Species List</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {Object.entries(spiecesData).map(([slug, item]) => (
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
                <div onClick={() => handleSelectItem(slug)}>
                  <strong>{item.name}</strong> ({slug})
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
            <h3>Edit Species</h3>
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
                  Description:
                </label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  style={{ width: "100%", padding: "8px" }}
                />
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
