import React, { useState, useEffect } from "react";
import type { OC, Tag } from "../helpers/objects";
import { loadOCs, loadTags } from "../helpers/data-load";
import censorData from "../data/vanilla-mode-censor.json";
import toast, { Toaster } from "react-hot-toast";
import "./EditorCommon.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";

interface CensorLists {
  ocs: string[];
  tags: string[];
}

const EditorVanillaModeCensor: React.FC = () => {
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

  const handleSaveToClipboard = async () => {
    try {
      const data: CensorLists = { ocs: censoredOcs, tags: censoredTags };
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Vanilla Mode Censor JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const getOcName = (slug: string): string => {
    const oc = allOcs.find((o) => o.slug === slug);
    return oc ? oc.name : slug;
  };

  const getTagName = (slug: string): string => {
    const tag = allTags.find((t) => t.slug === slug);
    return tag ? tag.name : slug;
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>Vanilla Mode Censor Editor</h2>
        <button
          onClick={handleSaveToClipboard}
          className="editor-button editor-button-success"
        >
          Copy to clipboard
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-form">
            <h3>Censored OCs ({censoredOcs.length})</h3>
            <p
              style={{ fontSize: "0.8em", color: "#888", marginBottom: "12px" }}
            >
              These OCs will be completely hidden when Vanilla Mode is enabled.
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
              page) when Vanilla Mode is enabled. The OC itself remains visible.
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
                  <span style={{ fontSize: "0.75em", color: "#888" }}>
                    ({tag.slug})
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(censoredOcs.length > 0 || censoredTags.length > 0) && (
        <div className="editor-form" style={{ marginTop: "20px" }}>
          <h3>Summary</h3>
          {censoredOcs.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <strong>Hidden OCs:</strong>{" "}
              {censoredOcs.map((slug) => getOcName(slug)).join(", ")}
            </div>
          )}
          {censoredTags.length > 0 && (
            <div>
              <strong>Hidden Tags:</strong>{" "}
              {censoredTags.map((slug) => getTagName(slug)).join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditorVanillaModeCensor;
