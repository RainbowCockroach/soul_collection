import { useState, useEffect, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import ImageCropper from "../common-components/ImageCropper";
import ButtonWrapper from "../common-components/ButtonWrapper";
import type { MessageContent } from "./types";
import { apiBaseUrl } from "../helpers/constants";
import buttonSendArt from "../assets/button_send_art.gif";
import buttonSoundGallery from "/sound-effect/button_gallery_item.mp3";
import { notifyNewGuestBookEntry } from "../helpers/discord-notify";

interface GuestBookFanArtFormProps {
  onSubmit: (
    messageContent: MessageContent,
    type: "note" | "fan art",
    password?: string | null,
    captchaToken?: string
  ) => Promise<void>;
  submitting?: boolean;
  showForm: boolean;
  onToggle: () => void;
  // Edit mode props
  isEditMode?: boolean;
  initialData?: {
    name?: string;
    thumbnail?: string;
    full_image?: string;
    caption?: string;
    content_warning?: string;
  };
  onCancel?: () => void;
}

const CONTENT_WARNINGS = [
  "Genitals",
  "Nipples",
  "Gore",
  "Drugs",
  "Eldritch horror beyond comprehension",
];

const GuestBookFanArtForm = ({
  onSubmit,
  submitting = false,
  showForm,
  onToggle,
  isEditMode = false,
  initialData,
  onCancel,
}: GuestBookFanArtFormProps) => {
  // Fan art form state
  const [fanArtForm, setFanArtForm] = useState({
    name: isEditMode && initialData?.name ? initialData.name : "",
    thumbnail:
      isEditMode && initialData?.thumbnail ? initialData.thumbnail : "",
    full_image:
      isEditMode && initialData?.full_image ? initialData.full_image : "",
    caption: isEditMode && initialData?.caption ? initialData.caption : "",
    password: "",
  });

  // Success message state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (isEditMode && initialData) {
      setFanArtForm({
        name: initialData.name || "",
        thumbnail: initialData.thumbnail || "",
        full_image: initialData.full_image || "",
        caption: initialData.caption || "",
        password: "",
      });

      // In edit mode, don't automatically set uploadVerified
      // Let user choose whether to keep existing image or upload new one

      // Parse content warnings for edit mode
      if (initialData.content_warning) {
        const warnings = initialData.content_warning.split(", ");
        const knownWarnings = warnings.filter((w) =>
          CONTENT_WARNINGS.includes(w)
        );
        const unknownWarnings = warnings.filter(
          (w) => !CONTENT_WARNINGS.includes(w)
        );

        setSelectedContentWarnings(knownWarnings);
        setOtherContentWarning(
          unknownWarnings.length > 0 ? unknownWarnings[0] : ""
        );

        if (unknownWarnings.length > 0) {
          setSelectedContentWarnings((prev) => [...prev, "Other"]);
        }
      }
    }
  }, [isEditMode, initialData]);

  // Image cropping and upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CAPTCHA state
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const captchaRef = useRef<TurnstileInstance>(null);

  // Content warning multi-select state
  const [selectedContentWarnings, setSelectedContentWarnings] = useState<
    string[]
  >([]);
  // Other content warning text
  const [otherContentWarning, setOtherContentWarning] = useState<string>("");

  const handleFanArtInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFanArtForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFanArtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build content warning string by combining selected warnings and custom "Other" text
    const allContentWarnings = [...selectedContentWarnings];
    if (
      selectedContentWarnings.includes("Other") &&
      otherContentWarning.trim()
    ) {
      // Replace "Other" with the custom text
      const index = allContentWarnings.indexOf("Other");
      allContentWarnings[index] = otherContentWarning.trim();
    } else if (
      !selectedContentWarnings.includes("Other") &&
      otherContentWarning.trim()
    ) {
      // If "Other" isn't checked but there's text, add it anyway
      allContentWarnings.push(otherContentWarning.trim());
    } else if (
      selectedContentWarnings.includes("Other") &&
      !otherContentWarning.trim()
    ) {
      // If "Other" is checked but no custom text, remove "Other"
      allContentWarnings.splice(allContentWarnings.indexOf("Other"), 1);
    }

    const messageContent: MessageContent = {
      name: fanArtForm.name || null,
      content: fanArtForm.caption || null,
      thumbnail: fanArtForm.thumbnail || null,
      full_image: fanArtForm.full_image || null,
      caption: fanArtForm.caption || null,
      content_warning:
        allContentWarnings.length > 0 ? allContentWarnings.join(", ") : null,
    };

    try {
      await onSubmit(messageContent, "fan art", fanArtForm.password || null);

      // Send Discord notification for new submissions (not edits)
      if (!isEditMode) {
        notifyNewGuestBookEntry("fan art", fanArtForm.name || "Anonymous").catch(
          (err) => {
            console.error("Discord notification failed:", err);
          }
        );
      }

      // Reset form on successful submission
      setFanArtForm({
        name: "",
        thumbnail: "",
        full_image: "",
        caption: "",
        password: "",
      });
      // Reset content warnings
      setSelectedContentWarnings([]);
      setOtherContentWarning("");

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000); // Hide after 3 seconds
    } catch (error) {
      // Error is already handled by the parent component
      // We don't show success message on error
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file");
        return;
      }

      // Validate file size (20MB)
      if (file.size > 20 * 1024 * 1024) {
        setUploadError("Image size must be less than 20MB");
        return;
      }

      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setShowCropper(true);
      setUploadError(null);
    }
  };

  // Handle crop completion
  const handleCropComplete = (croppedImage: Blob) => {
    setCroppedBlob(croppedImage);
    setShowCropper(false);

    // Always show CAPTCHA before upload (both guest and edit mode)
    setShowCaptcha(true);
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
    setShowCropper(false);
    setSelectedFile(null);
    setCroppedBlob(null);
  };

  // Handle CAPTCHA success
  const handleCaptchaSuccess = (token: string) => {
    setCaptchaToken(token);
    setShowCaptcha(false);

    // Upload both images after CAPTCHA verification
    if (croppedBlob && selectedFile) {
      uploadBothImages(croppedBlob, selectedFile);
    }
  };

  const handleCaptchaError = () => {
    setCaptchaToken(null);
    setUploadError("CAPTCHA verification failed. Please try again.");
  };

  // Upload both cropped thumbnail and original full image
  const uploadBothImages = async (thumbnailBlob: Blob, fullImageFile: File) => {
    setUploading(true);
    setUploadError(null);

    try {
      // CAPTCHA is always required (both guest and edit mode use guest endpoint)
      if (!captchaToken) {
        throw new Error("CAPTCHA verification required");
      }

      // Create FormData with both files
      const formData = new FormData();
      formData.append("thumbnail", thumbnailBlob, "thumbnail.jpg");
      formData.append("fullImage", fullImageFile);
      formData.append("captchaToken", captchaToken);

      // Single upload request for both images
      const response = await fetch(`${apiBaseUrl}/upload/images-guest`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload images");
      }

      const data = await response.json();

      // Store both URLs
      setFanArtForm((prev) => ({
        ...prev,
        thumbnail: data.thumbnailUrl,
        full_image: data.fullImageUrl,
      }));

      // Clean up
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
      setImageSrc(null);
      setSelectedFile(null);
      setCroppedBlob(null);

      // Reset CAPTCHA
      setCaptchaToken(null);
      if (captchaRef.current?.reset) {
        captchaRef.current.reset();
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload images"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleContentWarningChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const warning = e.target.value;
    const isChecked = e.target.checked;

    setSelectedContentWarnings((prev) => {
      if (isChecked) {
        // Add warning if checked
        return [...prev, warning];
      } else {
        // Remove warning if unchecked
        return prev.filter((w) => w !== warning);
      }
    });
  };

  const handleOtherContentWarningChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOtherContentWarning(e.target.value);
  };

  // In edit mode, render form directly without container
  if (isEditMode) {
    return (
      <form
        onSubmit={handleFanArtSubmit}
        className="div-3d-with-shadow guest-book-form"
      >
        <div className="form-group">
          <label htmlFor="fanart-name">Display name (optional)</label>
          <input
            type="text"
            id="fanart-name"
            name="name"
            value={fanArtForm.name}
            onChange={handleFanArtInputChange}
          />
        </div>

        <div className="form-group">
          <label>
            {initialData && (initialData.thumbnail || initialData.full_image)
              ? "Art"
              : "Upload your art"}
          </label>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {/* Show uploaded image if it exists */}
          {fanArtForm.full_image && (
            <div style={{ marginBottom: "10px" }}>
              <img
                src={fanArtForm.full_image}
                alt="Uploaded art preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  display: "block",
                  marginBottom: "8px",
                  border: "2px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <button
                type="button"
                onClick={handleUploadButtonClick}
                className="upload-trigger-button"
                disabled={submitting || uploading}
                style={{ fontSize: "14px" }}
              >
                {uploading ? "Uploading..." : "Change image"}
              </button>
            </div>
          )}

          {/* Show upload button only if no image uploaded */}
          {!fanArtForm.full_image && (
            <button
              type="button"
              onClick={handleUploadButtonClick}
              className="upload-trigger-button"
              disabled={submitting || uploading}
            >
              {uploading
                ? "Uploading..."
                : initialData &&
                  (initialData.thumbnail || initialData.full_image)
                ? "Upload new image"
                : "Upload image"}
            </button>
          )}

          {/* Upload error */}
          {uploadError && (
            <p style={{ color: "red", marginTop: "8px", fontSize: "14px" }}>
              {uploadError}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="fanart-caption">Caption (optional)</label>
          <input
            type="text"
            id="fanart-caption"
            name="caption"
            value={fanArtForm.caption}
            onChange={handleFanArtInputChange}
          />
        </div>

        <div className="form-group">
          <label>Content warning (optional)</label>
          <div className="content-warning-checkboxes">
            {CONTENT_WARNINGS.map((warning, index) => {
              const checkboxId = `content-warning-${index}`;
              return (
                <div key={index}>
                  <input
                    id={checkboxId}
                    type="checkbox"
                    value={warning}
                    checked={selectedContentWarnings.includes(warning)}
                    onChange={handleContentWarningChange}
                  />
                  <label htmlFor={checkboxId}>{warning}</label>
                </div>
              );
            })}
            <div className="checkbox-label">
              <input
                id="content-warning-other"
                type="checkbox"
                value="Other"
                checked={selectedContentWarnings.includes("Other")}
                onChange={handleContentWarningChange}
              />
              <label htmlFor="content-warning-other">Other</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          {selectedContentWarnings.includes("Other") && (
            <input
              type="text"
              placeholder="Specify other content warning..."
              value={otherContentWarning}
              onChange={handleOtherContentWarningChange}
            />
          )}
        </div>

        {!isEditMode && (
          <div className="form-group">
            <label htmlFor="fanart-password">
              Password (for edit/delete later, optional!)
            </label>
            <input
              type="text"
              id="fanart-password"
              name="password"
              value={fanArtForm.password}
              onChange={handleFanArtInputChange}
              placeholder="*don't set me as 123456 :)*"
            />
          </div>
        )}

        <div className={isEditMode ? "form-actions" : ""}>
          {isEditMode && onCancel && (
            <ButtonWrapper
              onClick={onCancel}
              disabled={submitting}
              className="cancel-button"
              type="button"
            >
              Cancel
            </ButtonWrapper>
          )}
          <ButtonWrapper
            type="submit"
            onClick={() => {}}
            disabled={
              submitting ||
              (!fanArtForm.thumbnail &&
                !fanArtForm.full_image &&
                !(
                  initialData &&
                  (initialData.thumbnail || initialData.full_image)
                ))
            }
            className="submit-button"
          >
            {submitting
              ? isEditMode
                ? "Updating..."
                : "Submitting..."
              : isEditMode
              ? "Update"
              : "Send!"}
          </ButtonWrapper>
        </div>

        {/* Success message for edit mode */}
        {showSuccessMessage && (
          <div
            className="success-message"
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#d4edda",
              color: "#155724",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            ✓ {isEditMode ? "Art updated!" : "Art sent!"}
          </div>
        )}
      </form>
    );
  }

  // Normal mode with toggle button and container
  return (
    <div className="form-container fanart-form-container">
      <ButtonWrapper
        className="form-toggle-button"
        onClick={onToggle}
        soundFile={buttonSoundGallery}
      >
        <img src={buttonSendArt} alt="Send" className="div-3d-with-shadow" />
      </ButtonWrapper>
      {showForm && (
        <form
          onSubmit={handleFanArtSubmit}
          className="div-3d-with-shadow guest-book-form"
        >
          <div className="form-group">
            <label htmlFor="fanart-name">Display name (optional)</label>
            <input
              type="text"
              id="fanart-name"
              name="name"
              value={fanArtForm.name}
              onChange={handleFanArtInputChange}
            />
          </div>

          <div className="form-group">
            <label>Upload your art</label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            {/* Show uploaded image if it exists */}
            {fanArtForm.full_image && (
              <div style={{ marginBottom: "10px" }}>
                <img
                  src={fanArtForm.full_image}
                  alt="Uploaded art preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    display: "block",
                    marginBottom: "8px",
                    border: "2px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
                <button
                  type="button"
                  onClick={handleUploadButtonClick}
                  className="upload-trigger-button"
                  disabled={submitting || uploading}
                  style={{ fontSize: "14px" }}
                >
                  {uploading ? "Uploading..." : "Change image"}
                </button>
              </div>
            )}

            {/* Show upload button only if no image uploaded */}
            {!fanArtForm.full_image && (
              <button
                type="button"
                onClick={handleUploadButtonClick}
                className="upload-trigger-button"
                disabled={submitting || uploading}
              >
                {uploading ? "Uploading..." : "Upload file"}
              </button>
            )}

            {/* Upload error */}
            {uploadError && (
              <p style={{ color: "red", marginTop: "8px", fontSize: "14px" }}>
                {uploadError}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="fanart-caption">Caption (optional)</label>
            <input
              type="text"
              id="fanart-caption"
              name="caption"
              value={fanArtForm.caption}
              onChange={handleFanArtInputChange}
            />
          </div>

          <div className="form-group">
            <label>Content warning (optional)</label>
            <div className="content-warning-checkboxes">
              {CONTENT_WARNINGS.map((warning, index) => {
                const checkboxId = `content-warning-${index}`;
                return (
                  <div key={index}>
                    <input
                      id={checkboxId}
                      type="checkbox"
                      value={warning}
                      checked={selectedContentWarnings.includes(warning)}
                      onChange={handleContentWarningChange}
                    />
                    <label htmlFor={checkboxId}>{warning}</label>
                  </div>
                );
              })}
              <div className="checkbox-label">
                <input
                  id="content-warning-other"
                  type="checkbox"
                  value="Other"
                  checked={selectedContentWarnings.includes("Other")}
                  onChange={handleContentWarningChange}
                />
                <label htmlFor="content-warning-other">Other</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            {selectedContentWarnings.includes("Other") && (
              <input
                type="text"
                placeholder="Specify other content warning..."
                value={otherContentWarning}
                onChange={handleOtherContentWarningChange}
              />
            )}
          </div>

          {!isEditMode && (
            <div className="form-group">
              <label htmlFor="fanart-password">
                Password (for edit/delete later, optional!)
              </label>
              <input
                type="text"
                id="fanart-password"
                name="password"
                value={fanArtForm.password}
                onChange={handleFanArtInputChange}
                placeholder="*don't set me as 123456 :)*"
              />
            </div>
          )}

          <div className={isEditMode ? "form-actions" : ""}>
            {isEditMode && onCancel && (
              <ButtonWrapper
                onClick={onCancel}
                disabled={submitting}
                className="cancel-button"
                type="button"
              >
                Cancel
              </ButtonWrapper>
            )}
            <ButtonWrapper
              type="submit"
              onClick={() => {}}
              disabled={
                submitting || (!fanArtForm.thumbnail && !fanArtForm.full_image)
              }
              className="submit-button"
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Submitting..."
                : isEditMode
                ? "Update"
                : "Send!"}
            </ButtonWrapper>
          </div>

          {/* Success message */}
          {showSuccessMessage && (
            <div
              className="success-message"
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#d4edda",
                color: "#155724",
                border: "1px solid #c3e6cb",
                borderRadius: "4px",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              ✓ Art sent!
            </div>
          )}
        </form>
      )}

      {/* Image Cropper Modal */}
      {imageSrc && (
        <ImageCropper
          isOpen={showCropper}
          imageSrc={imageSrc}
          aspectRatio={1 / 1.618}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          maxWidth={300}
          maxHeight={485}
        />
      )}

      {/* CAPTCHA Modal - required for both guest and edit mode */}
      {showCaptcha && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "400px",
            }}
          >
            <h3>Complete CAPTCHA to upload</h3>
            <Turnstile
              ref={captchaRef}
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={handleCaptchaSuccess}
              onError={handleCaptchaError}
              onExpire={handleCaptchaError}
            />
            <button
              type="button"
              onClick={handleCropCancel}
              style={{
                marginTop: "16px",
                padding: "8px 16px",
                backgroundColor: "#ccc",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestBookFanArtForm;
