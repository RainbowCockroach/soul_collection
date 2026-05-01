import React, { useState, useEffect } from "react";
import type { FormLink, OC } from "../helpers/objects";
import { loadFormLinks, loadOCs } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import SavePushButton from "./SavePushButton";
import DeleteButton from "./DeleteButton";
import "./EditorCommon.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";

export const EditorFormLink: React.FC = () => {
  const [formLinks, setFormLinks] = useState<FormLink[]>([]);
  const [ocs, setOcs] = useState<OC[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingLink, setEditingLink] = useState<FormLink>(["", ""]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [formLinksData, ocsData] = await Promise.all([
        loadFormLinks(),
        loadOCs(),
      ]);
      setFormLinks(formLinksData);
      setOcs(ocsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error loading data");
    }
  };

  const handleAddNew = () => {
    setEditingLink(["", ""]);
    setEditingIndex(null);
    setIsEditing(true);
  };

  const handleEdit = (index: number) => {
    setEditingLink([...formLinks[index]]);
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingLink[0] && !editingLink[1]) {
      toast.error("At least one OC must be selected");
      return;
    }

    if (editingLink[0] && editingLink[1] && editingLink[0] === editingLink[1]) {
      toast.error("Cannot link an OC to itself");
      return;
    }

    // Check for duplicates
    const isDuplicate = formLinks.some((link, index) => {
      if (editingIndex === index) return false; // Skip current item when editing
      return (
        (link[0] === editingLink[0] && link[1] === editingLink[1]) ||
        (link[0] === editingLink[1] && link[1] === editingLink[0])
      );
    });

    if (isDuplicate) {
      toast.error("This link already exists");
      return;
    }

    let updatedLinks: FormLink[];
    if (editingIndex !== null) {
      // Editing existing link
      updatedLinks = formLinks.map((link, index) =>
        index === editingIndex ? editingLink : link,
      );
    } else {
      // Adding new link
      updatedLinks = [...formLinks, editingLink];
    }

    setFormLinks(updatedLinks);
    setIsEditing(false);
    setEditingLink(["", ""]);
    setEditingIndex(null);
    toast.success("Link saved! Use 'Copy to clipboard' to export.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingLink(["", ""]);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const linkToDelete = formLinks[index];
    const oc1 = ocs.find((oc) => oc.slug === linkToDelete[0]);
    const oc2 = ocs.find((oc) => oc.slug === linkToDelete[1]);

    const confirmMessage = `Are you sure you want to delete the link between "${
      oc1?.name || "Unknown"
    }" and "${oc2?.name || "Unknown"}"?`;

    if (confirm(confirmMessage)) {
      const updatedLinks = formLinks.filter((_, i) => i !== index);
      setFormLinks(updatedLinks);
      toast.success("Link deleted! Use 'Copy to clipboard' to export.");
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(formLinks, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Links JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Error copying to clipboard");
    }
  };

  const getOcName = (slug: string): string => {
    const oc = ocs.find((oc) => oc.slug === slug);
    return oc ? oc.name : slug;
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <div className="editor-button-group">
          <SavePushButton fileId="form-link" getData={() => formLinks} />
          <button
            onClick={handleSaveToClipboard}
            className="editor-button editor-button-success"
          >
            Copy to clipboard
          </button>
        </div>
      </div>

      <div className="editor-button-group">
        <button
          onClick={handleAddNew}
          className="editor-button editor-button-primary"
        >
          Add New Link
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>OC Links ({formLinks.length})</h3>
            </div>
            <div className="editor-list">
              {formLinks.map((link, index) => (
                <div key={index} className="editor-item">
                  <div className="editor-item-content">
                    <div className="editor-oc-link-inline">
                      <BBCodeDisplay bbcode={getOcName(link[0])} />
                      <span>-</span>
                      <BBCodeDisplay bbcode={getOcName(link[1])} />
                    </div>
                  </div>
                  <div className="editor-item-actions">
                    <button
                      onClick={() => {
                        const updatedLinks = formLinks.map((l, i) =>
                          i === index ? ([l[1], l[0]] as FormLink) : l,
                        );
                        setFormLinks(updatedLinks);
                        toast.success(
                          "Swapped! Use 'Copy to clipboard' to export.",
                        );
                      }}
                      className="editor-button editor-button-secondary editor-button-small"
                      title="Swap birth and god form"
                    >
                      ⇅
                    </button>
                    <button
                      onClick={() => handleEdit(index)}
                      className="editor-button editor-button-secondary editor-button-small"
                    >
                      Edit
                    </button>
                    <DeleteButton
                      onClick={() => handleDelete(index)}
                      title="Delete link"
                    />
                  </div>
                </div>
              ))}
              {formLinks.length === 0 && (
                <div className="editor-empty-state">
                  No links created yet. Click "Add New Link" to create one.
                </div>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="editor-right">
            <div className="editor-form">
              <h3>{editingIndex !== null ? "Edit Link" : "Add New Link"}</h3>
              <div className="editor-field">
                <label className="editor-label">Birth Form</label>
                <select
                  value={editingLink[0]}
                  onChange={(e) =>
                    setEditingLink([e.target.value, editingLink[1]])
                  }
                  className="editor-select"
                >
                  <option value="">(none)</option>
                  {ocs.map((oc) => (
                    <option key={oc.slug} value={oc.slug}>
                      <BBCodeDisplay bbcode={oc.name} /> ({oc.slug})
                    </option>
                  ))}
                </select>
                {editingLink[0] && (
                  <div
                    className="editor-text-small"
                    style={{ marginTop: "4px" }}
                  >
                    <BBCodeDisplay bbcode={getOcName(editingLink[0])} />
                  </div>
                )}
              </div>

              <button
                onClick={() => setEditingLink([editingLink[1], editingLink[0]])}
                className="editor-button editor-button-secondary"
                title="Swap birth form and god form"
              >
                ⇅ Swap
              </button>

              <div className="editor-field">
                <label className="editor-label">God Form</label>
                <select
                  value={editingLink[1]}
                  onChange={(e) =>
                    setEditingLink([editingLink[0], e.target.value])
                  }
                  className="editor-select"
                >
                  <option value="">(none)</option>
                  {ocs.map((oc) => (
                    <option key={oc.slug} value={oc.slug}>
                      <BBCodeDisplay bbcode={oc.name} /> ({oc.slug})
                    </option>
                  ))}
                </select>
                {editingLink[1] && (
                  <div
                    className="editor-text-small"
                    style={{ marginTop: "4px" }}
                  >
                    <BBCodeDisplay bbcode={getOcName(editingLink[1])} />
                  </div>
                )}
              </div>

              <div className="editor-button-group">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
