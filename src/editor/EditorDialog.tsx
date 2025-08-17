import React, { useState, useEffect } from "react";
import type { DialogTexts } from "../helpers/objects";
import { loadDialogs } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import "./EditorDialog.css";

const EditorDialog: React.FC = () => {
  const [dialogs, setDialogs] = useState<DialogTexts>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedTexts, setSelectedTexts] = useState<string[]>([]);
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
    <div className="editor-dialog">
      <div className="editor-header">
        <h2>Dialog Editor</h2>
        <div className="editor-actions">
          <button onClick={handleAddDialog}>Add Dialog</button>
          <button onClick={handleSaveToClipboard}>Copy to clipboard</button>
        </div>
      </div>

      <div className="editor-content">
        <div className="dialog-list">
          <h3>Dialogs</h3>
          {Object.keys(dialogs).map((key) => (
            <div
              key={key}
              className={`dialog-item ${selectedKey === key ? "selected" : ""}`}
              onClick={() => handleSelectDialog(key)}
            >
              <div className="dialog-slug">{key}</div>
              <div className="dialog-preview">
                {dialogs[key][0]?.substring(0, 50)}...
              </div>
            </div>
          ))}
        </div>

        <div className="dialog-editor">
          {selectedKey ? (
            <>
              <div className="dialog-details">
                <div className="field-group">
                  <label>Dialog Key:</label>
                  <input
                    type="text"
                    value={selectedKey}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="field-group">
                  <label>Dialog Texts:</label>
                  {selectedTexts.map((text, index) => (
                    <div key={index} className="text-input-group">
                      <textarea
                        value={text}
                        onChange={(e) =>
                          handleTextChange(index, e.target.value)
                        }
                        disabled={!isEditing}
                        rows={3}
                      />
                      {isEditing && selectedTexts.length > 1 && (
                        <button
                          onClick={() => handleRemoveText(index)}
                          className="remove-text-btn"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button onClick={handleAddText} className="add-text-btn">
                      Add Text
                    </button>
                  )}
                </div>
              </div>

              <div className="editor-controls">
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className="save-btn">
                      Save
                    </button>
                    <button onClick={handleCancel} className="cancel-btn">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleEdit} className="edit-btn">
                      Edit
                    </button>
                    <button onClick={handleDeleteDialog} className="delete-btn">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="no-selection">Select a dialog to view or edit</div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default EditorDialog;
