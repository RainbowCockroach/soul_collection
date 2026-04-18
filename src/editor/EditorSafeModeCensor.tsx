import React, { useState, useEffect } from "react";
import type { OC, Tag } from "../helpers/objects";
import { loadOCs, loadTags } from "../helpers/data-load";
import censorData from "../data/safe-mode-censor.json";
import toast, { Toaster } from "react-hot-toast";
import SavePushButton from "./SavePushButton";
import CopyToClipboardButton from "./CopyToClipboardButton";
import "./EditorCommon.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";


const EditorSafeModeCensor: React.FC = () => {
  const [allOcs, setAllOcs] = useState<OC[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [censoredOcs, setCensoredOcs] = useState<string[]>([]);
  const [censoredTags, setCensoredTags] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ocs, tags] = await Promise.all([loadOCs(), loadTags()]);
        setAllOcs(ocs);
        setAllTags(tags);
        setCensoredOcs(censorData.ocs);
        setCensoredTags(censorData.tags);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      }
    };
    loadData();
  }, []);

  const toggleOc = (slug: string) => {
    setCensoredOcs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const toggleTag = (slug: string) => {
    setCensoredTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <div className="editor-button-group">
          <SavePushButton
            fileId="safe-mode-censor"
            getData={() => ({ ocs: censoredOcs, tags: censoredTags })}
          />
          <CopyToClipboardButton
            getData={() => ({ ocs: censoredOcs, tags: censoredTags })}
            entityLabel="Safe Mode Censor JSON"
          />
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-form">
            <h3>Censored OCs ({censoredOcs.length})</h3>
            <p
              style={{ fontSize: "0.8em", color: "#888", marginBottom: "12px" }}
            >
              These OCs will be completely hidden when Safe Mode is enabled.
            </p>
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {allOcs.map((oc) => (
                <label
                  key={oc.slug}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    backgroundColor: censoredOcs.includes(oc.slug)
                      ? "#ff444422"
                      : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={censoredOcs.includes(oc.slug)}
                    onChange={() => toggleOc(oc.slug)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span>
                    <BBCodeDisplay bbcode={oc.name} />
                  </span>
                  <span style={{ fontSize: "0.75em", color: "#888" }}>
                    ({oc.slug})
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="editor-right">
          <div className="editor-form">
            <h3>Censored Tags ({censoredTags.length})</h3>
            <p
              style={{ fontSize: "0.8em", color: "#888", marginBottom: "12px" }}
            >
              These tags will be hidden from display (filter bar, OC detail
              page) when Safe Mode is enabled. The OC itself remains visible.
            </p>
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {allTags.map((tag) => (
                <label
                  key={tag.slug}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    backgroundColor: censoredTags.includes(tag.slug)
                      ? "#ff444422"
                      : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={censoredTags.includes(tag.slug)}
                    onChange={() => toggleTag(tag.slug)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span
                    style={{
                      backgroundColor: tag.backgroundColour,
                      color: tag.textColour,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "0.85em",
                    }}
                  >
                    {tag.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorSafeModeCensor;
