import React, { useState, useEffect } from "react";
import type { Spieces } from "../helpers/objects";
import { loadSpecies } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import slugify from "slugify";
import SavePushButton from "./SavePushButton";
import CopyToClipboardButton from "./CopyToClipboardButton";
import { SCEditor } from "./BBCodeEditor";

const BBCODE_TOOLBAR = "bold,italic,underline,strike|color|image,link|source";
const BBCODE_TOOLBAR_MINIMAL = "image|source";
import ImagePreview from "./ImagePreview";
import DeleteButton from "./DeleteButton";
import "./EditorCommon.css";
import {
  parseContentWarning,
  buildContentWarning,
} from "../helpers/content-warning";

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
        `Are you sure you want to delete species "${spiecesData[slug].name}"?`,
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
    value: string,
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

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <div className="editor-button-group">
          <SavePushButton fileId="spieces" getData={() => spiecesData} />
          <CopyToClipboardButton
            getData={() => spiecesData}
            entityLabel="Species JSON"
          />
        </div>
      </div>

      <div className="editor-button-group">
        <button
          onClick={handleAddNew}
          className="editor-button editor-button-primary"
        >
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
                    selectedSlug === slug ? "editor-item-selected" : ""
                  }`}
                >
                  <div onClick={() => handleSelectItem(slug)}>
                    <strong>{item.name}</strong> ({slug})
                  </div>
                  <span onClick={(e) => e.stopPropagation()}>
                    <DeleteButton
                      onClick={() => handleDelete(slug)}
                      title="Delete species"
                    />
                  </span>
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
                />
                {!isNewItem() && (
                  <small className="editor-text-muted">
                    URL names cannot be changed for existing species to prevent
                    data corruption
                  </small>
                )}
              </div>

              <div className="editor-field">
                <label className="editor-label">Name:</label>
                <SCEditor
                  format="bbcode"
                  toolbar={BBCODE_TOOLBAR_MINIMAL}
                  value={editingItem.name}
                  onChange={(value) => {
                    const newName = value;
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
                  height={100}
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Description:</label>
                <SCEditor
                  format="bbcode"
                  toolbar={BBCODE_TOOLBAR}
                  value={editingItem.description}
                  onChange={(value) =>
                    setEditingItem({
                      ...editingItem,
                      description: value,
                    })
                  }
                  height={200}
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Content Warning:</label>
                <div className="editor-input-with-button">
                  <input
                    type="text"
                    value={
                      editingItem.contentWarning
                        ? parseContentWarning(editingItem.contentWarning).text
                        : ""
                    }
                    onChange={(e) => {
                      const safeOnly = editingItem.contentWarning
                        ? parseContentWarning(editingItem.contentWarning)
                            .safeOnly
                        : false;
                      setEditingItem({
                        ...editingItem,
                        contentWarning: e.target.value
                          ? buildContentWarning(e.target.value, safeOnly)
                          : "",
                      });
                    }}
                    className="editor-input"
                    placeholder="Content warning for species images (optional)"
                  />
                  <button
                    type="button"
                    className={`editor-button editor-button-small ${
                      editingItem.contentWarning &&
                      parseContentWarning(editingItem.contentWarning).safeOnly
                        ? "editor-button-toggle-active"
                        : "editor-button-secondary"
                    }`}
                    title="Toggle: show warning only in safe mode"
                    onClick={() => {
                      const raw = editingItem.contentWarning || "";
                      const { text, safeOnly } = parseContentWarning(raw);
                      if (text) {
                        setEditingItem({
                          ...editingItem,
                          contentWarning: buildContentWarning(text, !safeOnly),
                        });
                      }
                    }}
                  >
                    {editingItem.contentWarning &&
                    parseContentWarning(editingItem.contentWarning).safeOnly
                      ? "🛡️ Safe only"
                      : "🌶️ Both modes"}
                  </button>
                </div>
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
                    <DeleteButton
                      onClick={() => handleRemoveArrayItem("gallery", index)}
                      title="Remove gallery item"
                    />
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem("gallery")}
                  className="editor-button editor-button-primary editor-button-small"
                >
                  Add Gallery Item
                </button>
                <ImagePreview urls={editingItem.gallery} />
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
