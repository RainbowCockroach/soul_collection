import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import ImageUploadInput from "../common-components/ImageUploadInput";
import { apiBaseUrl } from "../helpers/constants";
import "./EditorCommon.css";

interface UploadedImage {
  id: string;
  thumbnailUrl: string;
  fullImageUrl: string;
  uploadedAt: string;
}

export const EditorImageUpload: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

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

  const loadRecentUploads = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter the API key first");
      return;
    }

    setIsLoadingRecent(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/uploads/recent?type=thumbnail&limit=20`,
        {
          method: "GET",
          headers: {
            "X-API-Key": apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch recent uploads");
      }

      const data = await response.json();
      setRecentImages(data.urls || []);
      toast.success(`Loaded ${data.urls?.length || 0} recent images`);
    } catch (error) {
      console.error("Error fetching recent uploads:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch recent uploads"
      );
    } finally {
      setIsLoadingRecent(false);
    }
  };

  return (
    <div className="editor-layout">
      <Toaster position="top-right" />

      {/* Left Panel - Upload Interface */}
      <div className="editor-left">
        <div className="editor-section">
          <div className="editor-section-header">
            <h3>Upload New Image</h3>
          </div>
          <div className="editor-section-content">
            {/* API Key Input */}
            <div className="editor-field">
              <label className="editor-label">Sam password</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Sam password"
                className="editor-input"
              />
              <p className="editor-text-muted" style={{ marginTop: "4px" }}>
                Required for authentication
              </p>
            </div>

            <ImageUploadInput
              onImageUploaded={handleImageUploaded}
              mode="admin"
              apiKey={apiKey}
            />
          </div>
        </div>

        <div className="editor-section">
          <div className="editor-section-header">
            <h3>Recent Server Uploads ({recentImages.length})</h3>
            <button
              onClick={loadRecentUploads}
              disabled={!apiKey.trim() || isLoadingRecent}
              className="editor-button editor-button-secondary editor-button-small"
            >
              {isLoadingRecent ? (
                <>
                  <div
                    className="editor-loading-spinner"
                    style={{ width: "14px", height: "14px" }}
                  />
                  Loading...
                </>
              ) : (
                "Refresh"
              )}
            </button>
          </div>
          <div className="editor-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {recentImages.length === 0 ? (
              <p style={{ color: "var(--editor-gray-600)", textAlign: "center", padding: "var(--editor-spacing-md)" }}>
                {apiKey.trim()
                  ? "Click refresh to load recent uploads"
                  : "Enter Sam password and click refresh to load recent uploads"}
              </p>
            ) : (
              recentImages.map((url, index) => {
                const filename = url.split("/").pop() || `image-${index + 1}`;
                const fullUrl = url.replace("/thumbnails/", "/full/");

                return (
                  <div key={url} className="editor-item" style={{ padding: "var(--editor-spacing-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--editor-spacing-sm)" }}>
                      <img
                        src={url}
                        alt="Recent upload"
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
                          {filename}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <button
                          onClick={() => copyToClipboard(fullUrl, "Full Image")}
                          className="editor-button editor-button-secondary editor-button-small"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Session Upload Details */}
      <div className="editor-right">
        {uploadedImages.length > 0 && (
          <div className="editor-section">
            <div className="editor-section-header">
              <h3>Current Session Uploads</h3>
            </div>
            <div className="editor-section-content">
              <p style={{ color: "var(--editor-gray-600)", marginBottom: "var(--editor-spacing-md)" }}>
                Click any URL to copy it to your clipboard
              </p>

              {uploadedImages.map((image) => (
                <div key={`urls-${image.id}`} className="editor-field" style={{ marginBottom: "var(--editor-spacing-lg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--editor-spacing-sm)" }}>
                    <h4 style={{ margin: 0 }}>Uploaded {image.uploadedAt}</h4>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="editor-button editor-button-danger editor-button-small"
                    >
                      Dismiss
                    </button>
                  </div>

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