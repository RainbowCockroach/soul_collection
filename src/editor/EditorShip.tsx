import React, { useState, useEffect } from "react";
import type { Ship, OC } from "../helpers/objects";
import { loadShips, loadOCs } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import SavePushButton from "./SavePushButton";
import ReorderButtons from "./ReorderButtons";
import "./EditorCommon.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

interface ShipItemProps {
  ship: Ship;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}

const ShipItem: React.FC<ShipItemProps> = ({
  ship,
  index,
  total,
  isSelected,
  onSelect,
  onDelete,
  onMove,
}) => {
  return (
    <div
      className={`editor-item ${isSelected ? "editor-item-selected" : ""}`}
      onClick={() => onSelect(index)}
    >
      <ReorderButtons index={index} total={total} onMove={onMove} />
      <div className="editor-item-content">
        <div className="editor-item-name">{ship.name}</div>
        <div className="editor-item-slug">OCs: {ship.oc.join(", ")}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
        className="editor-button editor-button-danger editor-button-small"
      >
        🗑
      </button>
    </div>
  );
};

export const EditorShip: React.FC = () => {
  const [ships, setShips] = useState<Ship[]>([]);
  const [selectedShipIndex, setSelectedShipIndex] = useState<number | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    color: "#FF1493",
    oc: [] as string[],
    shipText: {} as Record<string, string | undefined>,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [availableOcs, setAvailableOcs] = useState<OC[]>([]);
  const [newOcSlug, setNewOcSlug] = useState("");

  useEffect(() => {
    loadShipsData();
    loadOcsData();
  }, []);

  const loadShipsData = async () => {
    try {
      const loadedShips = await loadShips();
      setShips(loadedShips);
    } catch (error) {
      console.error("Error loading ships:", error);
      toast.error("Failed to load ships");
    }
  };

  const loadOcsData = async () => {
    try {
      const loadedOcs = await loadOCs();
      setAvailableOcs(loadedOcs);
    } catch (error) {
      console.error("Error loading OCs:", error);
      toast.error("Failed to load OCs");
    }
  };

  const handleSelectShip = (index: number) => {
    const ship = ships[index];
    if (ship) {
      setSelectedShipIndex(index);
      setFormData({
        name: ship.name,
        color: ship.color || "#FF1493",
        oc: [...ship.oc],
        shipText: ship.shipText ? { ...ship.shipText } : {},
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Ship name cannot be empty");
      return;
    }

    if (formData.oc.length === 0) {
      toast.error("Please add at least one OC to the ship");
      return;
    }

    const newShip: Ship = {
      name: formData.name,
      color: formData.color,
      oc: formData.oc,
      shipText: formData.shipText,
    };

    let updatedShips: Ship[];
    if (isEditing && selectedShipIndex !== null) {
      updatedShips = ships.map((ship, idx) =>
        idx === selectedShipIndex ? newShip : ship
      );
    } else {
      updatedShips = [...ships, newShip];
    }

    setShips(updatedShips);
    toast.success(isEditing ? "Ship updated" : "Ship created");
    handleCancelEdit();
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this ship?")) {
      const updatedShips = ships.filter((_, idx) => idx !== index);
      setShips(updatedShips);

      if (selectedShipIndex === index) {
        handleCancelEdit();
      } else if (selectedShipIndex !== null && selectedShipIndex > index) {
        setSelectedShipIndex(selectedShipIndex - 1);
      }
      toast.success("Ship deleted");
    }
  };

  const handleCancelEdit = () => {
    setSelectedShipIndex(null);
    setFormData({
      name: "",
      color: "#FF1493",
      oc: [],
      shipText: {},
    });
    setIsEditing(false);
    setNewOcSlug("");
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= ships.length) return;

    const newShips = [...ships];
    [newShips[index], newShips[newIndex]] = [newShips[newIndex], newShips[index]];
    setShips(newShips);

    if (selectedShipIndex === index) {
      setSelectedShipIndex(newIndex);
    } else if (selectedShipIndex === newIndex) {
      setSelectedShipIndex(index);
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(ships, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Ship JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleAddOc = () => {
    if (!newOcSlug.trim()) {
      toast.error("Please select an OC");
      return;
    }

    if (formData.oc.includes(newOcSlug)) {
      toast.error("This OC is already in the ship");
      return;
    }

    setFormData({
      ...formData,
      oc: [...formData.oc, newOcSlug],
    });
    setNewOcSlug("");
  };

  const handleRemoveOc = (ocSlug: string) => {
    const newShipText = { ...formData.shipText };
    delete newShipText[ocSlug];
    setFormData({
      ...formData,
      oc: formData.oc.filter((slug) => slug !== ocSlug),
      shipText: newShipText,
    });
  };

  const handleUpdateShipText = (ocSlug: string, text: string) => {
    setFormData({
      ...formData,
      shipText: {
        ...formData.shipText,
        [ocSlug]: text,
      },
    });
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>Ship Editor</h2>
        <SavePushButton fileId="ships" getData={() => ships} />
        <button
          onClick={handleSaveToClipboard}
          className="editor-button editor-button-success"
        >
          Copy to clipboard
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Ships ({ships.length})</h3>
            </div>
            {ships.map((ship, index) => (
              <ShipItem
                key={`ship-${index}`}
                ship={ship}
                index={index}
                total={ships.length}
                isSelected={selectedShipIndex === index}
                onSelect={handleSelectShip}
                onDelete={handleDelete}
                onMove={handleMove}
              />
            ))}
          </div>
        </div>

        <div className="editor-right">
          <div className="editor-form">
            <h3>{isEditing ? "Edit Ship" : "Add New Ship"}</h3>

            <div className="editor-field">
              <label className="editor-label">Ship Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter ship name (e.g., SamMia)"
                className="editor-input"
              />
            </div>

            <div className="editor-field">
              <label className="editor-label">Heart Color:</label>
              <div className="editor-color-group">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="editor-color-picker"
                />
                <div className="editor-color-preview-container">
                  <span className="editor-color-preview-label">Preview:</span>
                  <FontAwesomeIcon
                    icon={faHeart}
                    style={{ color: formData.color, fontSize: "32px" }}
                  />
                </div>
              </div>
            </div>

            <div className="editor-field">
              <label className="editor-label">OCs in Ship:</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <select
                  value={newOcSlug}
                  onChange={(e) => setNewOcSlug(e.target.value)}
                  className="editor-select"
                  style={{ flex: 1 }}
                >
                  <option value="">Select an OC...</option>
                  {availableOcs.map((oc) => (
                    <option key={oc.slug} value={oc.slug}>
                      <BBCodeDisplay bbcode={oc.name} />
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddOc}
                  className="editor-button editor-button-primary editor-button-small"
                >
                  Add
                </button>
              </div>
              <div className="editor-array-item">
                {formData.oc.length === 0 ? (
                  <div className="editor-text-muted">No OCs added yet</div>
                ) : (
                  formData.oc.map((ocSlug) => {
                    const oc = availableOcs.find((o) => o.slug === ocSlug);
                    return (
                      <div
                        key={ocSlug}
                        style={{
                          padding: "12px",
                          background: "white",
                          borderRadius: "4px",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={{ fontWeight: "bold" }}>
                            <BBCodeDisplay bbcode={oc ? oc.name : ocSlug} />
                          </span>
                          <button
                            onClick={() => handleRemoveOc(ocSlug)}
                            className="editor-button editor-button-danger editor-button-small"
                          >
                            Remove
                          </button>
                        </div>
                        <div>
                          <label
                            className="editor-label"
                            style={{ fontSize: "13px" }}
                          >
                            Ship Text (tooltip):
                          </label>
                          <input
                            type="text"
                            value={formData.shipText[ocSlug] || ""}
                            onChange={(e) =>
                              handleUpdateShipText(ocSlug, e.target.value)
                            }
                            placeholder={`e.g., "wife with ${
                              oc?.name || "other OC"
                            }"`}
                            className="editor-input"
                            style={{ fontSize: "13px" }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="editor-button-group">
              <button
                onClick={handleSave}
                className="editor-button editor-button-success"
              >
                {isEditing ? "Update" : "Add"} Ship
              </button>
              {isEditing && (
                <button
                  onClick={handleCancelEdit}
                  className="editor-button editor-button-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorShip;
