import { useState, useEffect } from "react";
import ImageUploadInput from "../common-components/ImageUploadInput";
import ButtonWrapper from "../common-components/ButtonWrapper";
import type { MessageContent } from "./types";
import buttonSendArt from "../assets/button_send_art.gif";
import buttonSoundGallery from "/sound-effect/button_gallery_item.mp3";

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

  // Upload state (simplified since ImageUploadInput handles its own CAPTCHA)
  const [showUploadInput, setShowUploadInput] = useState(false);

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
      // Reset upload state
      setShowUploadInput(false);

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

  const handleImageUploaded = (thumbnailUrl: string, fullImageUrl: string) => {
    setFanArtForm((prev) => ({
      ...prev,
      thumbnail: thumbnailUrl,
      full_image: fullImageUrl,
    }));
    // Note: ImageUploadInput now handles its own CAPTCHA state management
  };

  const handleUploadButtonClick = () => {
    // Show upload input (which will handle its own CAPTCHA)
    setShowUploadInput(true);
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
              ? "Fan art image"
              : "Upload your fan art"}
          </label>

          {/* Show current image info in edit mode */}
          {initialData && (initialData.thumbnail || initialData.full_image) && (
            <div className="current-image-info">
              <p>
                <strong>Current:</strong>{" "}
                {fanArtForm.full_image !==
                (initialData.full_image || initialData.thumbnail)
                  ? "New image uploaded"
                  : initialData.full_image || initialData.thumbnail}
              </p>
            </div>
          )}

          {/* Upload section */}
          {!showUploadInput ? (
            <button
              type="button"
              onClick={handleUploadButtonClick}
              className="upload-trigger-button"
              disabled={submitting}
            >
              {initialData && (initialData.thumbnail || initialData.full_image)
                ? "Upload new image"
                : "Upload image"}
            </button>
          ) : (
            <ImageUploadInput
              onImageUploaded={handleImageUploaded}
              disabled={submitting}
            />
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
          <div className="success-message" style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb",
            borderRadius: "4px",
            textAlign: "center",
            fontSize: "14px"
          }}>
            ✓ {isEditMode ? "Fan art updated successfully!" : "Fan art sent successfully!"}
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
            <label>Upload your fan art</label>
            {!showUploadInput ? (
              <button
                type="button"
                onClick={handleUploadButtonClick}
                className="upload-trigger-button"
                disabled={submitting}
              >
                Upload file
              </button>
            ) : (
              <ImageUploadInput
                onImageUploaded={handleImageUploaded}
                disabled={submitting}
              />
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
            <div className="success-message" style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#d4edda",
              color: "#155724",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
              textAlign: "center",
              fontSize: "14px"
            }}>
              ✓ Fan art sent successfully!
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default GuestBookFanArtForm;
