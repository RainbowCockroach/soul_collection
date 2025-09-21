import React, { useState, useEffect } from "react";
import type { Spieces } from "../helpers/objects";
import { loadSpecies } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import slugify from "slugify";
import "./EditorSpieces.css";
import "./EditorCommon.css";

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
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>Species Editor</h2>
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
          Add New Species
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Species List</h3>
            </div>
          <div className="editor-list">
            {Object.entries(spiecesData).map(([slug, item]) => (
              <div
                key={slug}
                className={`editor-item ${
                  selectedSlug === slug
                    ? "editor-item-selected"
                    : ""
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
                  className="editor-button editor-button-danger editor-button-small"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          </div>
        </div>

        {isEditing && editingItem && (
          <div className="editor-right">
            <div className="editor-form">
              <div className="editor-field">
                <label className="editor-label">Url name:</label>
                <input
                  type="text"
                  value={editingItem.slug}
                  onChange={(e) => {
                    if (isNewItem()) {
                      setEditingItem({ ...editingItem, slug: slugify(e.target.value, { lower: true, strict: true }) });
                    }
                  }}
                  className="editor-input"
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

              <div className="editor-field">
                <label className="editor-label">Name:</label>
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
                  className="editor-input"
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Description:</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="editor-textarea"
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Content Warning:</label>
                <input
                  type="text"
                  value={editingItem.contentWarning || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      contentWarning: e.target.value,
                    })
                  }
                  className="editor-input"
                  placeholder="Content warning for species images (optional)"
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Gallery:</label>
                {editingItem.gallery.map((url, index) => (
                  <div key={index} className="editor-array-item">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) =>
                        handleArrayFieldChange("gallery", index, e.target.value)
                      }
                      className="editor-array-input"
                      placeholder="Image URL"
                    />
                    <button
                      onClick={() => handleRemoveArrayItem("gallery", index)}
                      className="editor-button editor-button-danger editor-button-small"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem("gallery")}
                  className="editor-button editor-button-primary editor-button-small"
                >
                  Add Gallery Item
                </button>
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
