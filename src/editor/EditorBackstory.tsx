import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { loadOCs, loadOcBackstory } from "../helpers/data-load";
import type { OC } from "../helpers/objects";
import SavePushButton from "./SavePushButton";
import { SCEditor } from "./BBCodeEditor";

const BBCODE_TOOLBAR = "bold,italic,underline,strike|color|image,link|source";
import "./EditorCommon.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";

export const EditorBackstory: React.FC = () => {
  const [ocs, setOcs] = useState<OC[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOCs().then(setOcs);
  }, []);

  const handleSelect = async (slug: string) => {
    setSelectedSlug(slug);
    setLoading(true);
    try {
      const backstory = await loadOcBackstory(slug);
      const text = backstory ?? "";
      setContent(text);
      setOriginalContent(text);
    } catch {
      toast.error(`Failed to load backstory for ${slug}`);
      setContent("");
      setOriginalContent("");
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = () => {
    setContent(originalContent);
    toast.success("Reverted to saved version");
  };

  const hasChanges = content !== originalContent;

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>Backstory Editor</h2>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Characters ({ocs.length})</h3>
            </div>
            {ocs.map((oc) => (
              <div
                key={oc.slug}
                className={`editor-item ${selectedSlug === oc.slug ? "editor-item-selected" : ""}`}
                onClick={() => handleSelect(oc.slug)}
              >
                <div className="editor-item-content">
                  {oc.avatar?.[0] && (
                    <img
                      src={oc.avatar[0]}
                      alt={oc.name}
                      className="editor-avatar"
                    />
                  )}
                  <div>
                    <div className="editor-item-name">
                      <BBCodeDisplay bbcode={oc.name} />
                    </div>
                    <div className="editor-item-slug">{oc.slug}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="editor-right">
          {selectedSlug ? (
            loading ? (
              <div className="editor-form">
                <div className="editor-loading-spinner" />
                <p
                  className="editor-text-muted"
                  style={{ textAlign: "center", marginTop: 12 }}
                >
                  Loading backstory...
                </p>
              </div>
            ) : (
              <div className="editor-form">
                <h3>
                  Backstory for{" "}
                  <BBCodeDisplay
                    bbcode={
                      ocs.find((oc) => oc.slug === selectedSlug)?.name ||
                      selectedSlug
                    }
                  />
                </h3>
                <p className="editor-text-muted" style={{ marginBottom: 12 }}>
                  File:{" "}
                  <span className="editor-text-mono">
                    lore/{selectedSlug}.txt
                  </span>
                  {hasChanges && (
                    <span
                      style={{ color: "var(--editor-warning)", marginLeft: 8 }}
                    >
                      (unsaved changes)
                    </span>
                  )}
                </p>

                <div className="editor-field">
                  <label className="editor-label">Backstory Content:</label>
                  <SCEditor
                    format="bbcode"
                    toolbar={BBCODE_TOOLBAR}
                    value={content}
                    onChange={(value) => setContent(value)}
                    height={400}
                  />
                </div>

                <div className="editor-button-group">
                  <SavePushButton
                    fileId={`lore/${selectedSlug}`}
                    getData={() => content}
                    label="Save & Push Backstory"
                  />
                  <button
                    onClick={handleRevert}
                    disabled={!hasChanges}
                    className="editor-button editor-button-secondary"
                  >
                    Revert Changes
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(content);
                        toast.success("Copied to clipboard!");
                      } catch {
                        toast.error("Failed to copy");
                      }
                    }}
                    className="editor-button editor-button-success"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="editor-form">
              <p className="editor-text-muted">
                Select a character from the list to edit their backstory
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorBackstory;
