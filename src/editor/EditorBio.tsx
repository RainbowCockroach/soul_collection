import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { VNBioData, VNBioDialog } from "../helpers/objects";
import { loadVNBio } from "../helpers/data-load";
import "./EditorCommon.css";

const EMPTY_DIALOG: VNBioDialog = {
  speaker: "",
  text: "",
  speakerId: "",
  nameBadgeColor: "#ffffff",
  spriteUrl: "",
};

export const EditorBio: React.FC = () => {
  const [bioData, setBioData] = useState<VNBioData>({
    backgroundUrl: "",
    dialogs: [],
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<VNBioDialog>({ ...EMPTY_DIALOG });

  useEffect(() => {
    loadVNBio().then((data) => setBioData(data));
  }, []);

  const handleSelect = (index: number) => {
    const dialog = bioData.dialogs[index];
    if (dialog) {
      setSelectedIndex(index);
      setFormData({ ...dialog });
    }
  };

  const handleSave = () => {
    if (!formData.speaker.trim()) {
      toast.error("Speaker name is required");
      return;
    }
    if (!formData.text.trim()) {
      toast.error("Dialog text is required");
      return;
    }

    if (selectedIndex !== null) {
      const updated = [...bioData.dialogs];
      updated[selectedIndex] = { ...formData };
      setBioData({ ...bioData, dialogs: updated });
      toast.success("Dialog updated");
    }
  };

  const handleCancel = () => {
    setSelectedIndex(null);
    setFormData({ ...EMPTY_DIALOG });
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(bioData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("VN Bio JSON copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>Visual Novel Bio Editor</h2>
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
              <h3>Characters ({bioData.dialogs.length})</h3>
            </div>
            {bioData.dialogs.map((dialog, index) => (
              <div
                key={dialog.speakerId}
                className={`editor-item ${selectedIndex === index ? "editor-item-selected" : ""}`}
                onClick={() => handleSelect(index)}
              >
                <div className="editor-item-content">
                  <div className="editor-item-name">
                    <span
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: dialog.nameBadgeColor,
                        marginRight: 8,
                        verticalAlign: "middle",
                      }}
                    />
                    {dialog.speaker}
                  </div>
                  <div className="editor-item-slug">
                    {dialog.text.substring(0, 50)}
                    {dialog.text.length > 50 ? "..." : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Background URL */}
          <div className="editor-form" style={{ marginTop: 16 }}>
            <h3>Background</h3>
            <div className="editor-field">
              <label className="editor-label">Background Image URL:</label>
              <input
                type="text"
                value={bioData.backgroundUrl}
                onChange={(e) =>
                  setBioData({ ...bioData, backgroundUrl: e.target.value })
                }
                placeholder="Leave empty to use default bundled background"
                className="editor-input"
              />
              <p className="editor-text-muted">
                Leave empty to use the default bundled background image
              </p>
              {bioData.backgroundUrl && (
                <img
                  src={bioData.backgroundUrl}
                  alt="Background preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 150,
                    marginTop: 8,
                    borderRadius: 4,
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="editor-right">
          {selectedIndex !== null ? (
            <div className="editor-form">
              <h3>Edit {formData.speaker || "Dialog"}</h3>

              <div className="editor-field">
                <label className="editor-label">Speaker Name:</label>
                <input
                  type="text"
                  value={formData.speaker}
                  onChange={(e) =>
                    setFormData({ ...formData, speaker: e.target.value })
                  }
                  placeholder="e.g., Sam"
                  className="editor-input"
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Speaker ID:</label>
                <input
                  type="text"
                  value={formData.speakerId}
                  className="editor-input"
                  disabled
                />
                <p className="editor-text-muted">
                  Fixed identifier (cannot be changed)
                </p>
              </div>

              <div className="editor-field">
                <label className="editor-label">Dialog Text:</label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  placeholder="Enter dialog text..."
                  className="editor-textarea"
                  rows={6}
                  style={{ minHeight: 120 }}
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Name Badge Color:</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    type="color"
                    value={formData.nameBadgeColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nameBadgeColor: e.target.value,
                      })
                    }
                    className="editor-color-picker"
                  />
                  <span
                    style={{
                      backgroundColor: formData.nameBadgeColor,
                      color: "#fff",
                      padding: "4px 12px",
                      borderRadius: 4,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {formData.speaker || "Speaker"}
                  </span>
                  <span className="editor-text-muted">
                    {formData.nameBadgeColor}
                  </span>
                </div>
              </div>

              <div className="editor-field">
                <label className="editor-label">Sprite Image URL:</label>
                <input
                  type="text"
                  value={formData.spriteUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, spriteUrl: e.target.value })
                  }
                  placeholder="Leave empty to use default bundled sprite"
                  className="editor-input"
                />
                <p className="editor-text-muted">
                  Leave empty to use the default bundled sprite for{" "}
                  {formData.speaker || "this character"}
                </p>
                {formData.spriteUrl && (
                  <img
                    src={formData.spriteUrl}
                    alt="Sprite preview"
                    style={{
                      maxWidth: 200,
                      maxHeight: 200,
                      marginTop: 8,
                      borderRadius: 4,
                      objectFit: "contain",
                      backgroundColor: "#1a1a2e",
                    }}
                  />
                )}
              </div>

              <div className="editor-button-group">
                <button
                  onClick={handleSave}
                  className="editor-button editor-button-success"
                >
                  Update Dialog
                </button>
                <button
                  onClick={handleCancel}
                  className="editor-button editor-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="editor-form">
              <p className="editor-text-muted">
                Select a character from the list to edit their dialog
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorBio;
