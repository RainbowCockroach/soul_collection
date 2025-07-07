import React, { useState } from "react";
import { EditorSpieces } from "./EditorSpieces";
import { EditorGroup } from "./EditorGroup";
import { EditorOc } from "./EditorOc";
import { baseUrl } from "../helpers/constants";
import "./Editor.css";

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
    <div className="editor-container">
      <button onClick={() => window.open(`/${baseUrl}/ocs`, "_blank")}>
        Open preview
      </button>

      {/* Tab Navigation */}
      <div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`editor-tab ${activeTab === tab.id ? 'editor-tab-active' : 'editor-tab-inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="editor-content">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};
