import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { VNBioData, VNBioDialog } from "../helpers/objects";
import { loadVNBio } from "../helpers/data-load";
import SavePushButton from "./SavePushButton";
import CopyToClipboardButton from "./CopyToClipboardButton";
import { SCEditor } from "./BBCodeEditor";

const BBCODE_TOOLBAR = "bold,italic,underline,strike|color|image,link|source";
const BBCODE_TOOLBAR_MINIMAL = "image|source";
import "./EditorCommon.css";
import ImagePreview from "./ImagePreview";

const EMPTY_DIALOG: VNBioDialog = {
  speaker: "",
  text: [],
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
    if (formData.text.length === 0 || formData.text.every((t) => !t.trim())) {
      toast.error("At least one dialog line is required");
      return;
    }

    if (selectedIndex !== null) {
      const updated = [...bioData.dialogs];
      updated[selectedIndex] = { ...formData };
      setBioData({ ...bioData, dialogs: updated });
      toast.success("Dialog updated");
    }
  };

  const handleTextChange = (lineIndex: number, value: string) => {
    const newText = [...formData.text];
    newText[lineIndex] = value;
    setFormData({ ...formData, text: newText });
  };

  const handleAddLine = () => {
    setFormData({ ...formData, text: [...formData.text, ""] });
  };

  const handleRemoveLine = (lineIndex: number) => {
    const newText = formData.text.filter((_, i) => i !== lineIndex);
    setFormData({ ...formData, text: newText });
  };

  const handleMoveLine = (lineIndex: number, direction: -1 | 1) => {
    const newText = [...formData.text];
    const target = lineIndex + direction;
    if (target < 0 || target >= newText.length) return;
    [newText[lineIndex], newText[target]] = [newText[target], newText[lineIndex]];
    setFormData({ ...formData, text: newText });
  };

  const handleCancel = () => {
    setSelectedIndex(null);
    setFormData({ ...EMPTY_DIALOG });
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <div className="editor-button-group">
          <SavePushButton fileId="vn-bio" getData={() => bioData} />
          <CopyToClipboardButton
            getData={() => bioData}
            entityLabel="VN Bio JSON"
          />
        </div>
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
                    {dialog.text[0]?.substring(0, 50) ?? ""}
                    {(dialog.text[0]?.length ?? 0) > 50 ? "..." : ""}
                    {dialog.text.length > 1 ? ` (+${dialog.text.length - 1} more)` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Background URL */}
          <div className="editor-form" style={{ marginTop: "var(--editor-spacing-md)" }}>
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
              <ImagePreview urls={[bioData.backgroundUrl]} />
            </div>
          </div>
        </div>

        <div className="editor-right">
          {selectedIndex !== null ? (
            <div className="editor-form">
              <h3>Edit {formData.speaker || "Dialog"}</h3>

              <div className="editor-field">
                <label className="editor-label">Speaker Name:</label>
                <SCEditor
                  format="bbcode"
                  toolbar={BBCODE_TOOLBAR_MINIMAL}
                  value={formData.speaker}
                  onChange={(value) =>
                    setFormData({ ...formData, speaker: value })
                  }
                  height={100}
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
                <label className="editor-label">
                  Dialog Lines ({formData.text.length}):
                </label>
                {formData.text.map((line, i) => (
                  <div key={i} className="editor-section">
                    <div className="editor-section-header">
                      <h4>Line {i + 1}</h4>
                      <div className="editor-reorder-buttons">
                        <div className="editor-reorder-arrows">
                          <button
                            onClick={() => handleMoveLine(i, -1)}
                            disabled={i === 0}
                            className="editor-reorder-button"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleMoveLine(i, 1)}
                            disabled={i === formData.text.length - 1}
                            className="editor-reorder-button"
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveLine(i)}
                          className="editor-button editor-button-danger editor-button-small"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="editor-section-content">
                      <SCEditor
                        format="bbcode"
                        toolbar={BBCODE_TOOLBAR}
                        value={line}
                        onChange={(value) => handleTextChange(i, value)}
                        height={150}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddLine}
                  className="editor-button editor-button-primary"
                >
                  + Add Line
                </button>
              </div>

              <div className="editor-field">
                <label className="editor-label">Name Badge Color:</label>
                <div className="editor-color-preview-container">
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
                  <span className="editor-tag-preview" style={{ backgroundColor: formData.nameBadgeColor, color: "#fff" }}>
                    {formData.speaker || "Speaker"}
                  </span>
                  <span className="editor-text-muted editor-text-mono">
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
                <ImagePreview urls={[formData.spriteUrl]} />
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
