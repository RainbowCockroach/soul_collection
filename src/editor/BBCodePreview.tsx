import React, { useState } from "react";
import BBCodeDisplay from "../common-components/BBCodeDisplay";

interface BBCodePreviewProps {
  value: string;
}

const BBCodePreview: React.FC<BBCodePreviewProps> = ({ value }) => {
  const [show, setShow] = useState(false);

  if (!value) return null;

  return (
    <div className="editor-bbcode-preview-wrapper">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="editor-button editor-button-small editor-button-secondary editor-bbcode-preview-toggle"
      >
        {show ? "Hide Preview" : "Preview BBCode"}
      </button>
      {show && (
        <div className="editor-bbcode-preview-box">
          <BBCodeDisplay bbcode={value} />
        </div>
      )}
    </div>
  );
};

export default BBCodePreview;
