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
  const [editingLink, setEditingLink] = useState<FormLink>({
    godForm: "",
    birthForm: "",
  });

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
    setEditingLink({ godForm: "", birthForm: "" });
    setEditingIndex(null);
    setIsEditing(true);
  };

  const handleEdit = (index: number) => {
    setEditingLink({ ...formLinks[index] });
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingLink.godForm || !editingLink.birthForm) {
      toast.error("Both God Form and Birth Form must be selected");
      return;
    }

    if (editingLink.godForm === editingLink.birthForm) {
      toast.error("God Form and Birth Form cannot be the same OC");
      return;
    }

    // Check for duplicates
    const isDuplicate = formLinks.some((link, index) => {
      if (editingIndex === index) return false; // Skip current item when editing
      return (
        (link.godForm === editingLink.godForm &&
          link.birthForm === editingLink.birthForm) ||
        (link.godForm === editingLink.birthForm &&
          link.birthForm === editingLink.godForm)
      );
    });

    if (isDuplicate) {
      toast.error("This form link already exists");
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
    setEditingLink({ godForm: "", birthForm: "" });
    setEditingIndex(null);
    toast.success("Form link saved! Use 'Copy to clipboard' to export.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingLink({ godForm: "", birthForm: "" });
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const linkToDelete = formLinks[index];
    const godFormOc = ocs.find((oc) => oc.slug === linkToDelete.godForm);
    const birthFormOc = ocs.find((oc) => oc.slug === linkToDelete.birthForm);

    const confirmMessage = `Are you sure you want to delete the form link between "${
      godFormOc?.name || "Unknown"
    }" (God Form) and "${birthFormOc?.name || "Unknown"}" (Birth Form)?`;

    if (confirm(confirmMessage)) {
      const updatedLinks = formLinks.filter((_, i) => i !== index);
      setFormLinks(updatedLinks);
      toast.success("Form link deleted! Use 'Copy to clipboard' to export.");
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(formLinks, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Form links JSON copied to clipboard!");
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
      <h2>Form Link Editor</h2>
      <p>Manage links between God Form and Birth Form OCs</p>

      <div className="editor-form-link-buttons">
        <button onClick={handleAddNew} className="editor-form-link-button">
          Add New Form Link
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
          <h3>Form Links ({formLinks.length})</h3>
          <div className="editor-form-link-list">
            {formLinks.map((link, index) => (
              <div key={index} className="editor-form-link-item">
                <div className="editor-form-link-content">
                  <div className="editor-form-link-info">
                    <div className="editor-form-link-pair">
                      <span className="editor-form-link-label">God Form:</span>
                      <span className="editor-form-link-oc-name">
                        {getOcName(link.godForm)}
                      </span>
                    </div>
                    <div className="editor-form-link-pair">
                      <span className="editor-form-link-label">
                        Birth Form:
                      </span>
                      <span className="editor-form-link-oc-name">
                        {getOcName(link.birthForm)}
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
                No form links created yet. Click "Add New Form Link" to create
                one.
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="editor-form-link-right">
            <h3>
              {editingIndex !== null ? "Edit Form Link" : "Add New Form Link"}
            </h3>
            <div className="editor-form-link-form">
              <div className="editor-form-link-field">
                <label className="editor-form-link-field-label">
                  God Form:
                </label>
                <select
                  value={editingLink.godForm}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, godForm: e.target.value })
                  }
                  className="editor-form-link-select"
                >
                  <option value="">Select God Form OC</option>
                  {ocs.map((oc) => (
                    <option key={oc.slug} value={oc.slug}>
                      {oc.name} ({oc.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="editor-form-link-field">
                <label className="editor-form-link-field-label">
                  Birth Form:
                </label>
                <select
                  value={editingLink.birthForm}
                  onChange={(e) =>
                    setEditingLink({
                      ...editingLink,
                      birthForm: e.target.value,
                    })
                  }
                  className="editor-form-link-select"
                >
                  <option value="">Select Birth Form OC</option>
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
