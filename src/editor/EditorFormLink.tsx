import React, { useState, useEffect } from "react";
import type { FormLink, OC } from "../helpers/objects";
import { loadFormLinks, loadOCs } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import "./EditorFormLink.css";

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
    if (!editingLink[0] || !editingLink[1]) {
      toast.error("Both OCs must be selected");
      return;
    }

    if (editingLink[0] === editingLink[1]) {
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
        index === editingIndex ? editingLink : link
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
    <div className="editor-form-link-container">
      <Toaster position="top-right" />
      <h2>OC Link Editor</h2>

      <div className="editor-form-link-buttons">
        <button onClick={handleAddNew} className="editor-form-link-button">
          Add New Link
        </button>
        <button
          onClick={handleSaveToClipboard}
          className="editor-form-link-save-button"
        >
          Copy to clipboard
        </button>
      </div>

      <div className="editor-form-link-layout">
        <div className="editor-form-link-left">
          <h3>OC Links ({formLinks.length})</h3>
          <div className="editor-form-link-list">
            {formLinks.map((link, index) => (
              <div key={index} className="editor-form-link-item">
                <div className="editor-form-link-content">
                  <div className="editor-form-link-info">
                    <div className="editor-form-link-pair">
                      <span className="editor-form-link-oc-name">
                        {getOcName(link[0])}
                      </span>{" "}
                      <span> - </span>
                      <span className="editor-form-link-oc-name">
                        {getOcName(link[1])}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="editor-form-link-actions">
                  <button
                    onClick={() => handleEdit(index)}
                    className="editor-form-link-edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="editor-form-link-delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {formLinks.length === 0 && (
              <div className="editor-form-link-empty">
                No links created yet. Click "Add New Link" to create one.
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="editor-form-link-right">
            <h3>{editingIndex !== null ? "Edit Link" : "Add New Link"}</h3>
            <div className="editor-form-link-form">
              <div className="editor-form-link-field">
                <select
                  value={editingLink[0]}
                  onChange={(e) =>
                    setEditingLink([e.target.value, editingLink[1]])
                  }
                  className="editor-form-link-select"
                >
                  <option value="">Select First OC</option>
                  {ocs.map((oc) => (
                    <option key={oc.slug} value={oc.slug}>
                      {oc.name} ({oc.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="editor-form-link-field">
                <select
                  value={editingLink[1]}
                  onChange={(e) =>
                    setEditingLink([editingLink[0], e.target.value])
                  }
                  className="editor-form-link-select"
                >
                  <option value="">Select Second OC</option>
                  {ocs.map((oc) => (
                    <option key={oc.slug} value={oc.slug}>
                      {oc.name} ({oc.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="editor-form-link-form-buttons">
                <button
                  onClick={handleSave}
                  className="editor-form-link-save-form-button"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="editor-form-link-cancel-button"
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
