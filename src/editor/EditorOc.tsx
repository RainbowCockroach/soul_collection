import React, { useState, useEffect } from "react";
import type { OC, Group, Spieces, BreadcrumbItem } from "../helpers/objects";
import { loadOCs, loadGroups, loadSpecies } from "../helpers/data-load";
import "./EditorOc.css";

interface OcJsonData {
  [key: string]: Omit<OC, "slug">;
}

interface GroupJsonData {
  [key: string]: Omit<Group, "slug">;
}

interface SpiecesJsonData {
  [key: string]: Omit<Spieces, "slug">;
}

export const EditorOc: React.FC = () => {
  const [ocData, setOcData] = useState<OcJsonData>({});
  const [groupData, setGroupData] = useState<GroupJsonData>({});
  const [spiecesData, setSpiecesData] = useState<SpiecesJsonData>({});
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [editingItem, setEditingItem] = useState<OC | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ocsArray, groupsArray, speciesArray] = await Promise.all([
        loadOCs(),
        loadGroups(),
        loadSpecies(),
      ]);

      const ocData: OcJsonData = {};
      const groupData: GroupJsonData = {};
      const spiecesData: SpiecesJsonData = {};

      ocsArray.forEach((oc) => {
        const { slug, ...rest } = oc;
        ocData[slug] = rest;
      });

      groupsArray.forEach((group) => {
        const { slug, ...rest } = group;
        groupData[slug] = rest;
      });

      speciesArray.forEach((species) => {
        const { slug, ...rest } = species;
        spiecesData[slug] = rest;
      });

      setOcData(ocData);
      setGroupData(groupData);
      setSpiecesData(spiecesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSelectItem = (slug: string) => {
    setSelectedSlug(slug);
    setEditingItem({ ...ocData[slug], slug });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingItem) return;

    const updatedData = { ...ocData };
    const { slug, ...itemData } = editingItem;
    updatedData[slug] = itemData;

    setOcData(updatedData);
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
    alert("OC updated! Use 'Copy to clipboard' to export.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
  };

  const handleAddNew = () => {
    const newSlug = prompt("Enter url name for new OC:");
    if (newSlug && !ocData[newSlug]) {
      setEditingItem({
        slug: newSlug,
        name: "",
        avatar: "",
        group: [],
        spieces: [],
        info: "",
        gallery: [],
        breadcrumbs: [],
        tags: [],
      });
      setSelectedSlug(newSlug);
      setIsEditing(true);
    } else if (newSlug && ocData[newSlug]) {
      alert("OC with this slug already exists!");
    }
  };

  const handleDelete = (slug: string) => {
    if (confirm(`Are you sure you want to delete OC "${ocData[slug].name}"?`)) {
      const updatedData = { ...ocData };
      delete updatedData[slug];

      setOcData(updatedData);
      if (selectedSlug === slug) {
        setIsEditing(false);
        setEditingItem(null);
        setSelectedSlug("");
      }
      alert("OC deleted! Use 'Copy to clipboard' to export.");
    }
  };

  const handleGroupToggle = (groupSlug: string) => {
    if (!editingItem) return;

    const updatedGroups = editingItem.group.includes(groupSlug)
      ? editingItem.group.filter((g) => g !== groupSlug)
      : [...editingItem.group, groupSlug];

    setEditingItem({ ...editingItem, group: updatedGroups });
  };

  const handleSpeciesToggle = (spiecesSlug: string) => {
    if (!editingItem) return;

    const updatedSpecies = editingItem.spieces.includes(spiecesSlug)
      ? editingItem.spieces.filter((s) => s !== spiecesSlug)
      : [...editingItem.spieces, spiecesSlug];

    setEditingItem({ ...editingItem, spieces: updatedSpecies });
  };

  const handleArrayFieldChange = (
    field: "gallery" | "tags",
    index: number,
    value: string
  ) => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field]];
    updatedArray[index] = value;
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleAddArrayItem = (field: "gallery" | "tags") => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field], ""];
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleRemoveArrayItem = (
    field: "gallery" | "tags",
    index: number
  ) => {
    if (!editingItem) return;

    const updatedArray = editingItem[field].filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleBreadcrumbChange = (
    index: number,
    field: "description" | "images",
    value: string | string[]
  ) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = [...editingItem.breadcrumbs];
    if (field === "description") {
      updatedBreadcrumbs[index] = { ...updatedBreadcrumbs[index], description: value as string };
    } else {
      updatedBreadcrumbs[index] = { ...updatedBreadcrumbs[index], images: value as string[] };
    }
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleBreadcrumbImageChange = (
    breadcrumbIndex: number,
    imageIndex: number,
    value: string
  ) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = [...editingItem.breadcrumbs];
    const updatedImages = [...updatedBreadcrumbs[breadcrumbIndex].images];
    updatedImages[imageIndex] = value;
    updatedBreadcrumbs[breadcrumbIndex] = {
      ...updatedBreadcrumbs[breadcrumbIndex],
      images: updatedImages
    };
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleAddBreadcrumbImage = (breadcrumbIndex: number) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = [...editingItem.breadcrumbs];
    updatedBreadcrumbs[breadcrumbIndex] = {
      ...updatedBreadcrumbs[breadcrumbIndex],
      images: [...updatedBreadcrumbs[breadcrumbIndex].images, ""]
    };
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleRemoveBreadcrumbImage = (breadcrumbIndex: number, imageIndex: number) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = [...editingItem.breadcrumbs];
    updatedBreadcrumbs[breadcrumbIndex] = {
      ...updatedBreadcrumbs[breadcrumbIndex],
      images: updatedBreadcrumbs[breadcrumbIndex].images.filter((_, i) => i !== imageIndex)
    };
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleAddBreadcrumb = () => {
    if (!editingItem) return;

    const newBreadcrumb: BreadcrumbItem = { images: [], description: "" };
    setEditingItem({ ...editingItem, breadcrumbs: [...editingItem.breadcrumbs, newBreadcrumb] });
  };

  const handleRemoveBreadcrumb = (index: number) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = editingItem.breadcrumbs.filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(ocData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      alert("OC JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Error copying to clipboard");
    }
  };

  return (
    <div className="editor-oc-container">
      <h2>OC Editor</h2>

      <div className="editor-oc-buttons">
        <button onClick={handleAddNew} className="editor-oc-button">
          Add New OC
        </button>
        <button
          onClick={handleSaveToClipboard}
          className="editor-oc-save-button"
        >
          Copy to clipboard
        </button>
      </div>

      <div className="editor-oc-layout">
        <div className="editor-oc-left">
          <h3>OC List</h3>
          <div className="editor-oc-list">
            {Object.entries(ocData).map(([slug, item]) => (
              <div
                key={slug}
                className={`editor-oc-item ${
                  selectedSlug === slug
                    ? "editor-oc-item-selected"
                    : "editor-oc-item-default"
                }`}
              >
                <div
                  onClick={() => handleSelectItem(slug)}
                  className="editor-oc-item-content"
                >
                  <img
                    src={item.avatar || "https://placehold.co/40"}
                    alt={item.name}
                    className="editor-oc-avatar"
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
                  className="editor-oc-delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {isEditing && editingItem && (
          <div className="editor-oc-right">
            <h3>Edit OC</h3>
            <div className="editor-oc-form">
              <div className="editor-oc-field">
                <label className="editor-oc-label">Url name:</label>
                <input
                  type="text"
                  value={editingItem.slug}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, slug: e.target.value })
                  }
                  className="editor-oc-input"
                />
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Name:</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="editor-oc-input"
                />
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Avatar URL:</label>
                <input
                  type="text"
                  value={editingItem.avatar}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, avatar: e.target.value })
                  }
                  className="editor-oc-input"
                />
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Groups:</label>
                <div className="editor-oc-checkboxes">
                  {Object.entries(groupData).map(([slug, group]) => (
                    <div key={slug} className="editor-oc-checkbox-item">
                      <label className="editor-oc-checkbox-label">
                        <input
                          type="checkbox"
                          checked={editingItem.group.includes(slug)}
                          onChange={() => handleGroupToggle(slug)}
                        />
                        <div
                          className="editor-oc-group-color-box"
                          style={{ backgroundColor: group.frameColour }}
                        />
                        {group.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Species:</label>
                <div className="editor-oc-checkboxes">
                  {Object.entries(spiecesData).map(([slug, species]) => (
                    <div key={slug} className="editor-oc-checkbox-item">
                      <label className="editor-oc-checkbox-label">
                        <input
                          type="checkbox"
                          checked={editingItem.spieces.includes(slug)}
                          onChange={() => handleSpeciesToggle(slug)}
                        />
                        {species.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Info:</label>
                <textarea
                  value={editingItem.info}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, info: e.target.value })
                  }
                  rows={4}
                  className="editor-oc-textarea"
                />
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Gallery:</label>
                {editingItem.gallery.map((url, index) => (
                  <div key={index} className="editor-oc-array-item">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) =>
                        handleArrayFieldChange("gallery", index, e.target.value)
                      }
                      className="editor-oc-array-input"
                      placeholder="Image URL"
                    />
                    <button
                      onClick={() => handleRemoveArrayItem("gallery", index)}
                      className="editor-oc-remove-button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem("gallery")}
                  className="editor-oc-add-button"
                >
                  Add Gallery Item
                </button>
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Breadcrumbs:</label>
                {editingItem.breadcrumbs.map((breadcrumb, index) => (
                  <div key={index} className="editor-oc-breadcrumb-item">
                    <div className="editor-oc-breadcrumb-header">
                      <h4>Breadcrumb {index + 1}</h4>
                      <button
                        onClick={() => handleRemoveBreadcrumb(index)}
                        className="editor-oc-remove-button"
                      >
                        Remove Breadcrumb
                      </button>
                    </div>
                    
                    <div className="editor-oc-field">
                      <label className="editor-oc-label">Description:</label>
                      <textarea
                        value={breadcrumb.description}
                        onChange={(e) =>
                          handleBreadcrumbChange(index, "description", e.target.value)
                        }
                        rows={3}
                        className="editor-oc-textarea"
                        placeholder="Breadcrumb description"
                      />
                    </div>

                    <div className="editor-oc-field">
                      <label className="editor-oc-label">Images:</label>
                      {breadcrumb.images.map((imageUrl, imageIndex) => (
                        <div key={imageIndex} className="editor-oc-array-item">
                          <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) =>
                              handleBreadcrumbImageChange(index, imageIndex, e.target.value)
                            }
                            className="editor-oc-array-input"
                            placeholder="Image URL"
                          />
                          <button
                            onClick={() => handleRemoveBreadcrumbImage(index, imageIndex)}
                            className="editor-oc-remove-button"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddBreadcrumbImage(index)}
                        className="editor-oc-add-button"
                      >
                        Add Image
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddBreadcrumb}
                  className="editor-oc-add-button"
                >
                  Add Breadcrumb
                </button>
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Tags:</label>
                {editingItem.tags.map((tag, index) => (
                  <div key={index} className="editor-oc-array-item">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) =>
                        handleArrayFieldChange("tags", index, e.target.value)
                      }
                      className="editor-oc-array-input"
                      placeholder="Tag"
                    />
                    <button
                      onClick={() => handleRemoveArrayItem("tags", index)}
                      className="editor-oc-remove-button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem("tags")}
                  className="editor-oc-add-button"
                >
                  Add Tag
                </button>
              </div>

              <div className="editor-oc-form-buttons">
                <button
                  onClick={handleSave}
                  className="editor-oc-save-form-button"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="editor-oc-cancel-button"
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
