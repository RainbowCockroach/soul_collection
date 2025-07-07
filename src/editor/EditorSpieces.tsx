import React, { useState, useEffect } from "react";
import type { Spieces } from "../helpers/objects";
import { loadSpecies } from "../helpers/data-load";
import "./EditorSpieces.css";

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
    alert("Species updated! Use 'Copy to clipboard' to export.");
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
      alert("Species deleted! Use 'Copy to clipboard' to export.");
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
    <div className="editor-species-container">
      <h2>Species Editor</h2>

      <div className="editor-species-buttons">
        <button onClick={handleAddNew} className="editor-species-button">
          Add New Species
        </button>
        <button
          onClick={handleSaveToClipboard}
          className="editor-species-save-button"
        >
          Copy to clipboard
        </button>
      </div>

      <div className="editor-species-layout">
        <div className="editor-species-left">
          <h3>Species List</h3>
          <div className="editor-species-list">
            {Object.entries(spiecesData).map(([slug, item]) => (
              <div
                key={slug}
                className={`editor-species-item ${
                  selectedSlug === slug
                    ? "editor-species-item-selected"
                    : "editor-species-item-default"
                }`}
              >
                <div onClick={() => handleSelectItem(slug)}>
                  <strong>{item.name}</strong> ({slug})
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(slug);
                  }}
                  className="editor-species-delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {isEditing && editingItem && (
          <div className="editor-species-right">
            <h3>Edit Species</h3>
            <div className="editor-species-form">
              <div className="editor-species-field">
                <label className="editor-species-label">Url name:</label>
                <input
                  type="text"
                  value={editingItem.slug}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, slug: e.target.value })
                  }
                  className="editor-species-input"
                />
              </div>

              <div className="editor-species-field">
                <label className="editor-species-label">Name:</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="editor-species-input"
                />
              </div>

              <div className="editor-species-field">
                <label className="editor-species-label">Description:</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="editor-species-textarea"
                />
              </div>

              <div className="editor-species-form-buttons">
                <button
                  onClick={handleSave}
                  className="editor-species-save-form-button"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="editor-species-cancel-button"
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
