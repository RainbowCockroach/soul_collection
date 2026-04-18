import React, { useState } from "react";
import { EditorSpieces } from "./EditorSpieces";
import { EditorGroup } from "./EditorGroup";
import { EditorOc } from "./EditorOc";
import { EditorFormLink } from "./EditorFormLink";
import EditorTag from "./EditorTag";
import EditorShip from "./EditorShip";
import EditorDialog from "./EditorDialog";
import EditorAd from "./EditorAd";
import EditorSafeModeCensor from "./EditorSafeModeCensor";
import EditorBio from "./EditorBio";
import EditorBackstory from "./EditorBackstory";
import EditorHeightChart from "./EditorHeightChart";
import { EditorImageUpload } from "./EditorImageUpload";
import { EditorSoundUpload } from "./EditorSoundUpload";
import { EditorPinImageUrl } from "./EditorPinImageUrl";
import { EditorPasswordProvider } from "./EditorPasswordContext";
import { baseUrl } from "../helpers/constants";
import "./EditorCommon.css";

type EditorTab =
  | "species"
  | "groups"
  | "ocs"
  | "tags"
  | "ships"
  | "form-links"
  | "dialogs"
  | "bio"
  | "ads"
  | "safe-mode-censor"
  | "backstory"
  | "height-chart"
  | "uploads"
  | "sounds"
  | "pin-image-url";

export const Editor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EditorTab>("species");
  const tabs = [
    { id: "species" as const, label: "Species", component: EditorSpieces },
    { id: "groups" as const, label: "Groups", component: EditorGroup },
    { id: "ocs" as const, label: "OCs", component: EditorOc },
    { id: "tags" as const, label: "Tags", component: EditorTag },
    { id: "ships" as const, label: "Ships", component: EditorShip },
    {
      id: "form-links" as const,
      label: "Form Links",
      component: EditorFormLink,
    },
    { id: "dialogs" as const, label: "Dialogs", component: EditorDialog },
    { id: "bio" as const, label: "Biography", component: EditorBio },
    {
      id: "backstory" as const,
      label: "Backstory",
      component: EditorBackstory,
    },
    { id: "ads" as const, label: "Ads", component: EditorAd },
    {
      id: "safe-mode-censor" as const,
      label: "Safe Mode Censor",
      component: EditorSafeModeCensor,
    },
    {
      id: "height-chart" as const,
      label: "Height Chart",
      component: EditorHeightChart,
    },
    {
      id: "uploads" as const,
      label: "Image Upload",
      component: EditorImageUpload,
    },
    {
      id: "sounds" as const,
      label: "Sound Upload",
      component: EditorSoundUpload,
    },
    {
      id: "pin-image-url" as const,
      label: "Get Pin image url",
      component: EditorPinImageUrl,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <EditorPasswordProvider>
      <div className="editor-container page-padded">
        <div className="editor-header">
          <button
            onClick={() => window.open(`/${baseUrl}/ocs`, "_blank")}
            className="editor-button editor-button-secondary"
          >
            Open Preview
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="editor-button-group">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`editor-button ${
                activeTab === tab.id
                  ? "editor-button-primary"
                  : "editor-button-secondary"
              }`}
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
    </EditorPasswordProvider>
  );
};
