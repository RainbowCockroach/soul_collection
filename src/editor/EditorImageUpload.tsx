import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import ImageUploadInput from "../common-components/ImageUploadInput";
import "./EditorCommon.css";

interface UploadedImage {
  id: string;
  thumbnailUrl: string;
  fullImageUrl: string;
  uploadedAt: string;
}

export const EditorImageUpload: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const handleImageUploaded = (thumbnailUrl: string, fullImageUrl: string) => {
    if (thumbnailUrl && fullImageUrl) {
      // Add to uploaded images list
      const newImage: UploadedImage = {
        id: Date.now().toString(),
        thumbnailUrl,
        fullImageUrl,
        uploadedAt: new Date().toLocaleString(),
      };

      setUploadedImages(prev => [newImage, ...prev]);
      toast.success("Image uploaded successfully!");
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} URL copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    toast.success("Image removed from list");
  };

  return (
    <div className="editor-layout">
      <Toaster position="top-right" />

      {/* Left Panel - Upload Interface */}
      <div className="editor-left">
        <div className="editor-section">
          <h3>Upload New Image</h3>
          <ImageUploadInput
            onImageUploaded={handleImageUploaded}
          />
        </div>

        <div className="editor-section">
          <h3>Recent Uploads ({uploadedImages.length})</h3>
          <div className="editor-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {uploadedImages.length === 0 ? (
              <p style={{ color: "var(--editor-gray-600)", textAlign: "center", padding: "var(--editor-spacing-md)" }}>
                No images uploaded yet
              </p>
            ) : (
              uploadedImages.map((image) => (
                <div key={image.id} className="editor-item" style={{ padding: "var(--editor-spacing-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--editor-spacing-sm)" }}>
                    <img
                      src={image.thumbnailUrl}
                      alt="Uploaded image"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "var(--editor-border-radius)",
                        border: "1px solid var(--editor-gray-300)"
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--editor-gray-600)" }}>
                        {image.uploadedAt}
                      </p>
                    </div>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="editor-button editor-button-danger"
                      style={{ padding: "var(--editor-spacing-xs) var(--editor-spacing-sm)" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Image Details */}
      <div className="editor-right">
        {uploadedImages.length > 0 && (
          <div className="editor-section">
            <h3>Image URLs</h3>
            <p style={{ color: "var(--editor-gray-600)", marginBottom: "var(--editor-spacing-md)" }}>
              Click any URL to copy it to your clipboard
            </p>

            {uploadedImages.map((image) => (
              <div key={`urls-${image.id}`} className="editor-field" style={{ marginBottom: "var(--editor-spacing-lg)" }}>
                <h4 style={{ margin: 0, marginBottom: "var(--editor-spacing-sm)" }}>Uploaded {image.uploadedAt}</h4>

                <div className="editor-field">
                  <label>Thumbnail URL:</label>
                  <div style={{ display: "flex", gap: "var(--editor-spacing-xs)" }}>
                    <input
                      type="text"
                      value={image.thumbnailUrl}
                      readOnly
                      className="editor-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => copyToClipboard(image.thumbnailUrl, "Thumbnail")}
                      className="editor-button editor-button-secondary"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="editor-field">
                  <label>Full Image URL:</label>
                  <div style={{ display: "flex", gap: "var(--editor-spacing-xs)" }}>
                    <input
                      type="text"
                      value={image.fullImageUrl}
                      readOnly
                      className="editor-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => copyToClipboard(image.fullImageUrl, "Full image")}
                      className="editor-button editor-button-secondary"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "var(--editor-spacing-sm)", marginTop: "var(--editor-spacing-sm)" }}>
                  <a
                    href={image.thumbnailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="editor-button editor-button-secondary"
                  >
                    View Thumbnail
                  </a>
                  <a
                    href={image.fullImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="editor-button editor-button-secondary"
                  >
                    View Full Image
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {uploadedImages.length === 0 && (
          <div style={{ textAlign: "center", padding: "var(--editor-spacing-xl)", color: "var(--editor-gray-600)" }}>
            <p>Upload an image to see the URLs here</p>
          </div>
        )}
      </div>
    </div>
  );
};