import React, { useState, useEffect } from "react";
import type { OC, Group, Spieces } from "../helpers/objects";
import { loadOCs, loadGroups, loadSpecies } from "../helpers/data-load";

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
    alert("OC updated! Use 'Save to Clipboard' to export.");
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
      alert("OC deleted! Use 'Save to Clipboard' to export.");
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
    field: "gallery" | "breadcrumbs" | "tags",
    index: number,
    value: string
  ) => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field]];
    updatedArray[index] = value;
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleAddArrayItem = (field: "gallery" | "breadcrumbs" | "tags") => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field], ""];
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleRemoveArrayItem = (
    field: "gallery" | "breadcrumbs" | "tags",
    index: number
  ) => {
    if (!editingItem) return;

    const updatedArray = editingItem[field].filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, [field]: updatedArray });
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
    <div style={{ padding: "20px" }}>
      <h2>OC Editor</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleAddNew} style={{ marginRight: "10px" }}>
          Add New OC
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
          <h3>OC List</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {Object.entries(ocData).map(([slug, item]) => (
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
                  <img
                    src={item.avatar || "https://placehold.co/40"}
                    alt={item.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
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
          <div style={{ flex: 2 }}>
            <h3>Edit OC</h3>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "20px",
                maxHeight: "600px",
                overflowY: "auto",
              }}
            >
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
                  Avatar URL:
                </label>
                <input
                  type="text"
                  value={editingItem.avatar}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, avatar: e.target.value })
                  }
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Groups:
                </label>
                <div
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    maxHeight: "100px",
                    overflowY: "auto",
                  }}
                >
                  {Object.entries(groupData).map(([slug, group]) => (
                    <div key={slug} style={{ marginBottom: "5px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={editingItem.group.includes(slug)}
                          onChange={() => handleGroupToggle(slug)}
                        />
                        <div
                          style={{
                            width: "15px",
                            height: "15px",
                            backgroundColor: group.frameColour,
                            border: "1px solid #ccc",
                          }}
                        />
                        {group.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Species:
                </label>
                <div
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    maxHeight: "100px",
                    overflowY: "auto",
                  }}
                >
                  {Object.entries(spiecesData).map(([slug, species]) => (
                    <div key={slug} style={{ marginBottom: "5px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
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

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Info:
                </label>
                <textarea
                  value={editingItem.info}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, info: e.target.value })
                  }
                  rows={4}
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Gallery:
                </label>
                {editingItem.gallery.map((url, index) => (
                  <div
                    key={index}
                    style={{ display: "flex", gap: "5px", marginBottom: "5px" }}
                  >
                    <input
                      type="text"
                      value={url}
                      onChange={(e) =>
                        handleArrayFieldChange("gallery", index, e.target.value)
                      }
                      style={{ flex: 1, padding: "8px" }}
                      placeholder="Image URL"
                    />
                    <button
                      onClick={() => handleRemoveArrayItem("gallery", index)}
                      style={{
                        backgroundColor: "#ff6b6b",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem("gallery")}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                  }}
                >
                  Add Gallery Item
                </button>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Breadcrumbs:
                </label>
                {editingItem.breadcrumbs.map((text, index) => (
                  <div
                    key={index}
                    style={{ display: "flex", gap: "5px", marginBottom: "5px" }}
                  >
                    <input
                      type="text"
                      value={text}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "breadcrumbs",
                          index,
                          e.target.value
                        )
                      }
                      style={{ flex: 1, padding: "8px" }}
                      placeholder="Breadcrumb text"
                    />
                    <button
                      onClick={() =>
                        handleRemoveArrayItem("breadcrumbs", index)
                      }
                      style={{
                        backgroundColor: "#ff6b6b",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem("breadcrumbs")}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                  }}
                >
                  Add Breadcrumb
                </button>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Tags:
                </label>
                {editingItem.tags.map((tag, index) => (
                  <div
                    key={index}
                    style={{ display: "flex", gap: "5px", marginBottom: "5px" }}
                  >
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) =>
                        handleArrayFieldChange("tags", index, e.target.value)
                      }
                      style={{ flex: 1, padding: "8px" }}
                      placeholder="Tag"
                    />
                    <button
                      onClick={() => handleRemoveArrayItem("tags", index)}
                      style={{
                        backgroundColor: "#ff6b6b",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem("tags")}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                  }}
                >
                  Add Tag
                </button>
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
