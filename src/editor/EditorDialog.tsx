import React, { useState, useEffect } from "react";
import type { DialogTexts, DialogEntry } from "../helpers/objects";
import { loadDialogs } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import "./EditorCommon.css";

const EditorDialog: React.FC = () => {
  const [dialogs, setDialogs] = useState<DialogTexts>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedTexts, setSelectedTexts] = useState<DialogEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadDialogs().then(setDialogs);
  }, []);

  const handleSelectDialog = (key: string) => {
    setSelectedKey(key);
    setSelectedTexts([...dialogs[key]]);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedKey) {
      const updatedDialogs = {
        ...dialogs,
        [selectedKey]: selectedTexts,
      };
      setDialogs(updatedDialogs);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (selectedKey) {
      setSelectedTexts([...dialogs[selectedKey]]);
    }
    setIsEditing(false);
  };

  const handleAddDialog = () => {
    const newKey = `dialog-${Date.now()}`;
    const newTexts = ["New dialog text"];
    const updatedDialogs = {
      ...dialogs,
      [newKey]: newTexts,
    };
    setDialogs(updatedDialogs);
    setSelectedKey(newKey);
    setSelectedTexts([...newTexts]);
    setIsEditing(true);
  };

  const handleDeleteDialog = () => {
    if (selectedKey) {
      const updatedDialogs = { ...dialogs };
      delete updatedDialogs[selectedKey];
      setDialogs(updatedDialogs);
      setSelectedKey(null);
      setSelectedTexts([]);
      setIsEditing(false);
    }
  };

  const handleKeyChange = (newKey: string) => {
    if (selectedKey && selectedKey !== newKey) {
      const updatedDialogs = { ...dialogs };
      updatedDialogs[newKey] = updatedDialogs[selectedKey];
      delete updatedDialogs[selectedKey];
      setDialogs(updatedDialogs);
      setSelectedKey(newKey);
    }
  };

  const handleTextChange = (index: number, value: string) => {
    const updatedTexts = [...selectedTexts];
    updatedTexts[index] = value;
    setSelectedTexts(updatedTexts);
  };

  const handleAddText = () => {
    setSelectedTexts([...selectedTexts, "New text"]);
  };

  const handleRemoveText = (index: number) => {
    if (selectedTexts.length > 1) {
      const updatedTexts = selectedTexts.filter((_, i) => i !== index);
      setSelectedTexts(updatedTexts);
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(dialogs, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Dialog JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>Dialog Editor</h2>
        <div className="editor-button-group">
          <button
            onClick={handleAddDialog}
            className="editor-button editor-button-primary"
          >
            Add Dialog
          </button>
          <button
            onClick={handleSaveToClipboard}
            className="editor-button editor-button-success"
          >
            Copy to clipboard
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Dialogs</h3>
            </div>
          {Object.keys(dialogs).map((key) => (
            <div
              key={key}
              className={`editor-item ${selectedKey === key ? "editor-item-selected" : ""}`}
              onClick={() => handleSelectDialog(key)}
            >
              <div className="editor-item-content">
                <div>
                  <div className="editor-item-name">{key}</div>
                  <div className="editor-item-slug">
                    {typeof dialogs[key][0] === 'string'
                      ? dialogs[key][0].substring(0, 50) + '...'
                      : 'Dialog item...'}
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>

        <div className="editor-right">
          <div className="editor-form">
            {selectedKey ? (
              <>
                <h3>Dialog Details</h3>

                <div className="editor-field">
                  <label className="editor-label">Dialog Key:</label>
                  <input
                    type="text"
                    value={selectedKey}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    disabled={!isEditing}
                    className="editor-input"
                  />
                </div>

                <div className="editor-field">
                  <label className="editor-label">Dialog Texts:</label>
                  {selectedTexts.map((text, index) => (
                    <div key={index} className="editor-array-item">
                      <textarea
                        value={typeof text === 'string' ? text : JSON.stringify(text)}
                        onChange={(e) =>
                          handleTextChange(index, e.target.value)
                        }
                        disabled={!isEditing}
                        rows={3}
                        className="editor-textarea"
                        style={{ flex: 1 }}
                      />
                      {isEditing && selectedTexts.length > 1 && (
                        <button
                          onClick={() => handleRemoveText(index)}
                          className="editor-button editor-button-danger editor-button-small"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={handleAddText}
                      className="editor-button editor-button-primary editor-button-small"
                    >
                      Add Text
                    </button>
                  )}
                </div>

                <div className="editor-button-group">
                  {isEditing ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleEdit}
                        className="editor-button editor-button-primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteDialog}
                        className="editor-button editor-button-danger"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="editor-empty-state">
                Select a dialog to view or edit
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default EditorDialog;
