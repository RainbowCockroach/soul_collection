import { useState, useRef, type DragEvent } from "react";
import { apiBaseUrl } from "../helpers/constants";

interface ImageUploadInputProps {
  onImageUploaded: (thumbnailUrl: string, fullImageUrl: string) => void;
  disabled?: boolean;
  captchaToken?: string | null;
}

interface ImageUploadResponse {
  thumbnailUrl: string;
  fullImageUrl: string;
}

const ImageUploadInput = ({
  onImageUploaded,
  disabled = false,
  captchaToken = null,
}: ImageUploadInputProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // Check if captcha token is available
      if (!captchaToken) {
        throw new Error("Please complete the CAPTCHA verification first");
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image size must be less than 10MB");
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to server
      const formData = new FormData();
      formData.append("image", file);
      formData.append("captchaToken", captchaToken);

      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data: ImageUploadResponse = await response.json();
      onImageUploaded(data.thumbnailUrl, data.fullImageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageUploaded("", "");
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        style={{ display: "none" }}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? "2px dashed #0066cc" : "2px dashed #ccc",
          padding: "20px",
          textAlign: "center",
          cursor: disabled || uploading ? "not-allowed" : "pointer",
          backgroundColor: isDragging ? "#f0f8ff" : "transparent",
        }}
      >
        {uploading ? (
          <p>Uploading...</p>
        ) : preview ? (
          <div>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: "200px", maxHeight: "200px" }}
            />
            <p>Image uploaded successfully!</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              Clear
            </button>
          </div>
        ) : (
          <p>Click or drag an image here to upload</p>
        )}
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "8px" }}>Error: {error}</p>
      )}
    </div>
  );
};

export default ImageUploadInput;
