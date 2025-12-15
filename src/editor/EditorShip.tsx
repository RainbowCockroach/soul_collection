import React, { useState, useEffect } from "react";
import type { Ship, OC } from "../helpers/objects";
import { loadShips, loadOCs } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./EditorCommon.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";

interface SortableShipItemProps {
  ship: Ship;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
}

const SortableShipItem: React.FC<SortableShipItemProps> = ({
  ship,
  index,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `ship-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`editor-item ${isSelected ? "editor-item-selected" : ""}`}
      onClick={() => onSelect(index)}
    >
      <div {...attributes} {...listeners} className="editor-drag-handle">
        ⋮⋮
      </div>
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
    displayIcon: "",
    oc: [] as string[],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [availableOcs, setAvailableOcs] = useState<OC[]>([]);
  const [newOcSlug, setNewOcSlug] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        displayIcon: ship.displayIcon,
        oc: [...ship.oc],
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
      displayIcon: formData.displayIcon,
      oc: formData.oc,
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
      displayIcon: "",
      oc: [],
    });
    setIsEditing(false);
    setNewOcSlug("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = parseInt(active.id.toString().split("-")[1]);
      const overIndex = parseInt(over.id.toString().split("-")[1]);

      const newShips = arrayMove(ships, activeIndex, overIndex);
      setShips(newShips);

      // Update selected index if needed
      if (selectedShipIndex === activeIndex) {
        setSelectedShipIndex(overIndex);
      } else if (selectedShipIndex === overIndex) {
        setSelectedShipIndex(
          activeIndex > overIndex
            ? selectedShipIndex + 1
            : selectedShipIndex - 1
        );
      }
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
    setFormData({
      ...formData,
      oc: formData.oc.filter((slug) => slug !== ocSlug),
    });
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>Ship Editor</h2>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={ships.map((_, index) => `ship-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                {ships.map((ship, index) => (
                  <SortableShipItem
                    key={`ship-${index}`}
                    ship={ship}
                    index={index}
                    isSelected={selectedShipIndex === index}
                    onSelect={handleSelectShip}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
              <label className="editor-label">Display Icon (BBCode):</label>
              <textarea
                value={formData.displayIcon}
                onChange={(e) =>
                  setFormData({ ...formData, displayIcon: e.target.value })
                }
                placeholder="[img]https://example.com/icon.gif[/img]"
                className="editor-textarea"
              />
              {formData.displayIcon && (
                <div className="editor-field" style={{ marginTop: "8px" }}>
                  <label className="editor-label">Preview:</label>
                  <div
                    style={{
                      padding: "8px",
                      background: "white",
                      borderRadius: "4px",
                    }}
                  >
                    <BBCodeDisplay bbcode={formData.displayIcon} />
                  </div>
                </div>
              )}
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
                      {oc.name} ({oc.slug})
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
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px",
                          background: "white",
                          borderRadius: "4px",
                          marginBottom: "4px",
                        }}
                      >
                        <span>
                          {oc ? oc.name : ocSlug} ({ocSlug})
                        </span>
                        <button
                          onClick={() => handleRemoveOc(ocSlug)}
                          className="editor-button editor-button-danger editor-button-small"
                        >
                          Remove
                        </button>
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
