import React, { useState } from "react";

interface ImagePreviewProps {
  urls: string[];
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ urls }) => {
  const [show, setShow] = useState(false);

  const validUrls = urls.filter((u) => u.trim() !== "");
  if (validUrls.length === 0) return null;

  return (
    <div className="editor-image-preview-wrapper">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="editor-button editor-button-small editor-button-secondary editor-image-preview-toggle"
      >
        {show ? "Hide Preview" : "Preview Image"}
      </button>
      {show && (
        <div className="editor-image-preview-box">
          {validUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Preview ${index + 1}`}
              className="editor-image-preview-img"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
