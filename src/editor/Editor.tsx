import React, { useState } from "react";
import { EditorSpieces } from "./EditorSpieces";
import { EditorGroup } from "./EditorGroup";
import { EditorOc } from "./EditorOc";

type EditorTab = "species" | "groups" | "ocs";

export const Editor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EditorTab>("species");

  const tabs = [
    { id: "species" as const, label: "Species", component: EditorSpieces },
    { id: "groups" as const, label: "Groups", component: EditorGroup },
    { id: "ocs" as const, label: "OCs", component: EditorOc },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Data Editor</h1>

      {/* Tab Navigation */}
      <div
        style={{
          borderBottom: "2px solid #ccc",
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              backgroundColor: activeTab === tab.id ? "#007bff" : "#f8f9fa",
              color: activeTab === tab.id ? "white" : "#495057",
              borderRadius: "4px 4px 0 0",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? "bold" : "normal",
              borderBottom: activeTab === tab.id ? "2px solid #007bff" : "none",
              marginBottom: "-2px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div style={{ minHeight: "600px" }}>
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};
