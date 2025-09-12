import React, { useState, useEffect } from "react";
import type { Spieces } from "../helpers/objects";
import { loadSpecies } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import slugify from "slugify";
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

  const isNewItem = () => {
    return editingItem && !spiecesData[editingItem.slug];
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
    toast.success("Species updated! Use 'Copy to clipboard' to export.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
  };

  const handleAddNew = () => {
    const speciesName = prompt("Enter name for new species:");
    if (speciesName) {
      const newSlug = slugify(speciesName, { lower: true, strict: true });
      if (!spiecesData[newSlug]) {
        setEditingItem({
          slug: newSlug,
          name: speciesName,
          description: "",
          gallery: [],
          contentWarning: "",
        });
        setSelectedSlug(newSlug);
        setIsEditing(true);
      } else {
        toast.error("A species with this name already exists!");
      }
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
      toast.success("Species deleted! Use 'Copy to clipboard' to export.");
    }
  };

  const handleArrayFieldChange = (
    field: "gallery",
    index: number,
    value: string
  ) => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field]];
    updatedArray[index] = value;
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleAddArrayItem = (field: "gallery") => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field], ""];
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleRemoveArrayItem = (field: "gallery", index: number) => {
    if (!editingItem) return;

    const updatedArray = editingItem[field].filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(spiecesData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Species JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Error copying to clipboard");
    }
  };

  return (
    <div className="editor-species-container">
      <Toaster position="top-right" />
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
                  onChange={(e) => {
                    if (isNewItem()) {
                      setEditingItem({ ...editingItem, slug: slugify(e.target.value, { lower: true, strict: true }) });
                    }
                  }}
                  className="editor-species-input"
                  disabled={!isNewItem()}
                  style={{ 
                    backgroundColor: !isNewItem() ? '#f5f5f5' : 'white',
                    cursor: !isNewItem() ? 'not-allowed' : 'text'
                  }}
                />
                {!isNewItem() && (
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    URL names cannot be changed for existing species to prevent data corruption
                  </small>
                )}
              </div>

              <div className="editor-species-field">
                <label className="editor-species-label">Name:</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    if (isNewItem()) {
                      const newSlug = slugify(newName, { lower: true, strict: true });
                      setEditingItem({ ...editingItem, name: newName, slug: newSlug });
                    } else {
                      setEditingItem({ ...editingItem, name: newName });
                    }
                  }}
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

              <div className="editor-species-field">
                <label className="editor-species-label">Content Warning:</label>
                <input
                  type="text"
                  value={editingItem.contentWarning || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      contentWarning: e.target.value,
                    })
                  }
                  className="editor-species-input"
                  placeholder="Content warning for species images (optional)"
                />
              </div>

              <div className="editor-species-field">
                <label className="editor-species-label">Gallery:</label>
                {editingItem.gallery.map((url, index) => (
                  <div key={index} className="editor-species-array-item">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) =>
                        handleArrayFieldChange("gallery", index, e.target.value)
                      }
                      className="editor-species-array-input"
                      placeholder="Image URL"
                    />
                    <button
                      onClick={() => handleRemoveArrayItem("gallery", index)}
                      className="editor-species-remove-button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem("gallery")}
                  className="editor-species-add-button"
                >
                  Add Gallery Item
                </button>
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
