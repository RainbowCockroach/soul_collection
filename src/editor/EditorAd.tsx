import React, { useState, useEffect } from "react";
import type { AdLocations, AdItem } from "../helpers/objects";
import { loadAds } from "../helpers/data-load";
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

interface SortableAdItemProps {
  ad: AdItem;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
}

const SortableAdItem: React.FC<SortableAdItemProps> = ({
  ad,
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
  } = useSortable({ id: `ad-${index}` });

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
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt="Ad preview"
            className="editor-avatar"
            style={{ objectFit: "contain" }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="editor-item-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ad.imageUrl || "No image"}
          </div>
          <div className="editor-item-slug" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ad.redirectUrl || "No redirect URL"}
          </div>
        </div>
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

const EditorAd: React.FC = () => {
  const [adsData, setAdsData] = useState<AdLocations>({});
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedAdIndex, setSelectedAdIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    redirectUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadAdsData();
  }, []);

  const loadAdsData = async () => {
    try {
      const loadedAds = await loadAds();
      setAdsData(loadedAds);

      // Auto-select first location if available
      const locations = Object.keys(loadedAds);
      if (locations.length > 0 && !selectedLocation) {
        setSelectedLocation(locations[0]);
      }
    } catch (error) {
      console.error("Error loading ads:", error);
      toast.error("Failed to load ads");
    }
  };

  const currentAds = selectedLocation ? adsData[selectedLocation] || [] : [];

  const handleSelectAd = (index: number) => {
    const ad = currentAds[index];
    if (ad) {
      setSelectedAdIndex(index);
      setFormData({
        imageUrl: ad.imageUrl,
        redirectUrl: ad.redirectUrl,
      });
      setIsEditing(true);
    }
  };

  const handleSaveAd = () => {
    if (!selectedLocation) {
      toast.error("Please select a location first");
      return;
    }

    if (!formData.imageUrl.trim()) {
      toast.error("Image URL cannot be empty");
      return;
    }

    const newAd: AdItem = {
      imageUrl: formData.imageUrl,
      redirectUrl: formData.redirectUrl,
    };

    const updatedAds = [...currentAds];
    if (isEditing && selectedAdIndex !== null) {
      updatedAds[selectedAdIndex] = newAd;
    } else {
      updatedAds.push(newAd);
    }

    setAdsData({
      ...adsData,
      [selectedLocation]: updatedAds,
    });

    toast.success(isEditing ? "Ad updated" : "Ad created");
    handleCancelEdit();
  };

  const handleDeleteAd = (index: number) => {
    if (window.confirm("Are you sure you want to delete this ad?")) {
      const updatedAds = currentAds.filter((_, idx) => idx !== index);
      setAdsData({
        ...adsData,
        [selectedLocation]: updatedAds,
      });

      if (selectedAdIndex === index) {
        handleCancelEdit();
      } else if (selectedAdIndex !== null && selectedAdIndex > index) {
        setSelectedAdIndex(selectedAdIndex - 1);
      }
      toast.success("Ad deleted");
    }
  };

  const handleCancelEdit = () => {
    setSelectedAdIndex(null);
    setFormData({
      imageUrl: "",
      redirectUrl: "",
    });
    setIsEditing(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = parseInt(active.id.toString().split("-")[1]);
      const overIndex = parseInt(over.id.toString().split("-")[1]);

      const newAds = arrayMove(currentAds, activeIndex, overIndex);
      setAdsData({
        ...adsData,
        [selectedLocation]: newAds,
      });

      // Update selected index if needed
      if (selectedAdIndex === activeIndex) {
        setSelectedAdIndex(overIndex);
      } else if (selectedAdIndex === overIndex) {
        setSelectedAdIndex(
          activeIndex > overIndex
            ? selectedAdIndex + 1
            : selectedAdIndex - 1
        );
      }
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(adsData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Ads JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };


  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>Advertisement Editor</h2>
        <button
          onClick={handleSaveToClipboard}
          className="editor-button editor-button-success"
        >
          Copy to clipboard
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-section" style={{ marginBottom: "16px" }}>
            <div className="editor-section-header">
              <h4>Select Ad Location</h4>
            </div>
            <div className="editor-section-content">
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  handleCancelEdit();
                }}
                className="editor-select"
              >
                <option value="">Select location...</option>
                {Object.keys(adsData).map((locationId) => (
                  <option key={locationId} value={locationId}>
                    {locationId} ({adsData[locationId].length} ads)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="editor-list">
            <div className="editor-list-header">
              <h3>
                {selectedLocation
                  ? `Ads in "${selectedLocation}" (${currentAds.length})`
                  : "Select a location"}
              </h3>
            </div>
            {selectedLocation && currentAds.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentAds.map((_, index) => `ad-${index}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {currentAds.map((ad, index) => (
                    <SortableAdItem
                      key={`ad-${index}`}
                      ad={ad}
                      index={index}
                      isSelected={selectedAdIndex === index}
                      onSelect={handleSelectAd}
                      onDelete={handleDeleteAd}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
            {selectedLocation && currentAds.length === 0 && (
              <div className="editor-empty-state">No ads in this location</div>
            )}
          </div>
        </div>

        <div className="editor-right">
          <div className="editor-form">
            <h3>{isEditing ? "Edit Ad" : "Add New Ad"}</h3>

            {!selectedLocation && (
              <div className="editor-text-muted" style={{ marginBottom: "16px" }}>
                Please select or create a location first
              </div>
            )}

            <div className="editor-field">
              <label className="editor-label">Image URL:</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://example.com/ad-image.png"
                className="editor-input"
                disabled={!selectedLocation}
              />
            </div>

            <div className="editor-field">
              <label className="editor-label">Redirect URL:</label>
              <input
                type="text"
                value={formData.redirectUrl}
                onChange={(e) =>
                  setFormData({ ...formData, redirectUrl: e.target.value })
                }
                placeholder="https://example.com/destination"
                className="editor-input"
                disabled={!selectedLocation}
              />
            </div>

            {formData.imageUrl && (
              <div className="editor-field">
                <label className="editor-label">Preview:</label>
                <div
                  style={{
                    border: "1px solid var(--editor-gray-300)",
                    borderRadius: "var(--editor-border-radius)",
                    padding: "16px",
                    backgroundColor: "white",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={formData.imageUrl}
                    alt="Ad preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      toast.error("Failed to load image");
                    }}
                  />
                </div>
              </div>
            )}

            <div className="editor-button-group">
              <button
                onClick={handleSaveAd}
                className="editor-button editor-button-success"
                disabled={!selectedLocation}
              >
                {isEditing ? "Update" : "Add"} Ad
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

export default EditorAd;
