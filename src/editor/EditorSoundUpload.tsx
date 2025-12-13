import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { apiBaseUrl } from "../helpers/constants";
import "./EditorCommon.css";

interface UploadedAudio {
  id: string;
  audioUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export const EditorSoundUpload: React.FC = () => {
  const [uploadedAudios, setUploadedAudios] = useState<UploadedAudio[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/m4a",
      "audio/ogg",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only audio files (MP3, M4A, AAC, OGG, WAV) are allowed");
      return;
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 25MB");
      return;
    }

    setSelectedFile(file);
    toast.success(`Selected: ${file.name}`);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an audio file");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("Please enter the API key");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("audio", selectedFile);

      const response = await fetch(`${apiBaseUrl}/upload/audio`, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload audio");
      }

      const data = await response.json();

      // Add to uploaded audios list
      const newAudio: UploadedAudio = {
        id: Date.now().toString(),
        audioUrl: data.audioUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        uploadedAt: new Date().toLocaleString(),
      };

      setUploadedAudios((prev) => [newAudio, ...prev]);
      toast.success("Audio uploaded successfully!");

      // Reset selected file
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload audio"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const removeAudio = (id: string) => {
    setUploadedAudios((prev) => prev.filter((audio) => audio.id !== id));
    toast.success("Audio removed from list");
  };

  return (
    <div className="editor-layout">
      <Toaster position="top-right" />

      {/* Left Panel - Upload Interface */}
      <div className="editor-left">
        <div className="editor-section">
          <div className="editor-section-header">
            <h3>Upload New Audio</h3>
          </div>
          <div className="editor-section-content">
            {/* API Key Input */}
            <div className="editor-field">
              <label className="editor-label">API Key (Password)</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key"
                className="editor-input"
              />
              <p className="editor-text-muted" style={{ marginTop: "4px" }}>
                Required for authentication
              </p>
            </div>

            {/* File Drop Zone */}
            <div className="editor-field">
              <label className="editor-label">Audio File</label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`editor-form ${
                  dragActive ? "editor-upload-area-dragging" : ""
                }`}
                style={{
                  textAlign: "center",
                  padding: "var(--editor-spacing-xl)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() =>
                  document.getElementById("audio-file-input")?.click()
                }
              >
                <input
                  id="audio-file-input"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileInputChange}
                  style={{ display: "none" }}
                />
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : "Click or drag audio file here"}
                </p>
                <p className="editor-text-muted" style={{ marginTop: "8px" }}>
                  MP3, M4A, AAC, OGG, WAV (max 25MB)
                </p>
                {selectedFile && (
                  <p className="editor-text-muted" style={{ marginTop: "4px" }}>
                    Size: {formatFileSize(selectedFile.size)}
                  </p>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !apiKey.trim() || isUploading}
              className="editor-button editor-button-success"
              style={{ width: "100%" }}
            >
              {isUploading ? (
                <>
                  <div className="editor-loading-spinner" />
                  Uploading...
                </>
              ) : (
                "Upload Audio"
              )}
            </button>
          </div>
        </div>

        <div className="editor-section">
          <div className="editor-section-header">
            <h3>Recent Uploads ({uploadedAudios.length})</h3>
          </div>
          <div
            className="editor-list"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {uploadedAudios.length === 0 ? (
              <p
                style={{
                  color: "var(--editor-gray-600)",
                  textAlign: "center",
                  padding: "var(--editor-spacing-md)",
                }}
              >
                No audio files uploaded yet
              </p>
            ) : (
              uploadedAudios.map((audio) => (
                <div
                  key={audio.id}
                  className="editor-item"
                  style={{ padding: "var(--editor-spacing-sm)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--editor-spacing-sm)",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "var(--editor-border-radius)",
                        border: "1px solid var(--editor-gray-300)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "var(--editor-gray-100)",
                        flexShrink: 0,
                      }}
                    >
                      🔊
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 500,
                          fontSize: "14px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {audio.fileName}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.75rem",
                          color: "var(--editor-gray-600)",
                        }}
                      >
                        {formatFileSize(audio.fileSize)} • {audio.uploadedAt}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAudio(audio.id)}
                      className="editor-button editor-button-danger editor-button-small"
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

      {/* Right Panel - Audio Details */}
      <div className="editor-right">
        {uploadedAudios.length > 0 && (
          <div className="editor-section">
            <div className="editor-section-header">
              <h3>Audio URLs & Preview</h3>
            </div>
            <div className="editor-section-content">
              <p
                style={{
                  color: "var(--editor-gray-600)",
                  marginBottom: "var(--editor-spacing-md)",
                }}
              >
                Click any URL to copy it to your clipboard
              </p>

              {uploadedAudios.map((audio) => (
                <div
                  key={`urls-${audio.id}`}
                  className="editor-field"
                  style={{ marginBottom: "var(--editor-spacing-lg)" }}
                >
                  <h4
                    style={{
                      margin: 0,
                      marginBottom: "var(--editor-spacing-sm)",
                    }}
                  >
                    {audio.fileName}
                  </h4>
                  <p
                    className="editor-text-muted"
                    style={{ marginBottom: "var(--editor-spacing-sm)" }}
                  >
                    Uploaded {audio.uploadedAt} •{" "}
                    {formatFileSize(audio.fileSize)}
                  </p>

                  <div className="editor-field">
                    <label>Audio URL:</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--editor-spacing-xs)",
                      }}
                    >
                      <input
                        type="text"
                        value={audio.audioUrl}
                        readOnly
                        className="editor-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => copyToClipboard(audio.audioUrl, "URL")}
                        className="editor-button editor-button-secondary"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Audio Player Preview */}
                  <div className="editor-field">
                    <label>Preview:</label>
                    <audio
                      controls
                      src={audio.audioUrl}
                      style={{ width: "100%", marginTop: "8px" }}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "var(--editor-spacing-sm)",
                      marginTop: "var(--editor-spacing-sm)",
                    }}
                  >
                    <a
                      href={audio.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="editor-button editor-button-secondary"
                    >
                      Open in New Tab
                    </a>
                    <a
                      href={audio.audioUrl}
                      download={audio.fileName}
                      className="editor-button editor-button-secondary"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadedAudios.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--editor-spacing-xl)",
              color: "var(--editor-gray-600)",
            }}
          >
            <p>Upload an audio file to see the URL and preview here</p>
          </div>
        )}
      </div>
    </div>
  );
};
