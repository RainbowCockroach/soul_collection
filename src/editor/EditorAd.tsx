import React, { useState, useEffect } from "react";
import type { AdLocations, AdItem } from "../helpers/objects";
import { loadAds } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import SavePushButton from "./SavePushButton";
import ReorderButtons from "./ReorderButtons";
import "./EditorCommon.css";
import ImagePreview from "./ImagePreview";

interface AdListItemProps {
  ad: AdItem;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}

const AdListItem: React.FC<AdListItemProps> = ({
  ad,
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

  const handleMove = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentAds.length) return;

    const newAds = [...currentAds];
    [newAds[index], newAds[newIndex]] = [newAds[newIndex], newAds[index]];
    setAdsData({
      ...adsData,
      [selectedLocation]: newAds,
    });

    if (selectedAdIndex === index) {
      setSelectedAdIndex(newIndex);
    } else if (selectedAdIndex === newIndex) {
      setSelectedAdIndex(index);
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
        <SavePushButton fileId="ads" getData={() => adsData} />
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
              <>
                {currentAds.map((ad, index) => (
                  <AdListItem
                    key={`ad-${index}`}
                    ad={ad}
                    index={index}
                    total={currentAds.length}
                    isSelected={selectedAdIndex === index}
                    onSelect={handleSelectAd}
                    onDelete={handleDeleteAd}
                    onMove={handleMove}
                  />
                ))}
              </>
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

            <ImagePreview urls={[formData.imageUrl]} />

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
