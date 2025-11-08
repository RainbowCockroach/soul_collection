import React, { useState, useRef, useEffect } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import ButtonWrapper from "../common-components/ButtonWrapper";
import ImageUploadInput from "../common-components/ImageUploadInput";
import type { Message, MessageContent } from "./types";
import { apiBaseUrl } from "../helpers/constants";
import blinkies from "../data/guestbook-blinkies.json";
import "./EditMessageModal.css";

interface EditMessageModalProps {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BLINKIES = blinkies as string[];
const CONTENT_WARNINGS = [
  "Genitals",
  "Nipples",
  "Gore",
  "Drugs",
  "Eldritch horror beyond comprehension",
];

const EditMessageModal: React.FC<EditMessageModalProps> = ({
  message,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"password" | "edit">("password");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<MessageContent>({
    name: "",
    content: "",
    blinkies: [],
    thumbnail: "",
    full_image: "",
    caption: "",
    content_warning: "",
  });

  // Content warning state for fan art
  const [selectedContentWarnings, setSelectedContentWarnings] = useState<string[]>([]);
  const [otherContentWarning, setOtherContentWarning] = useState<string>("");

  // Blinkie dropdown state
  const [blinkieDropdownOpen, setBlinkieDropdownOpen] = useState(false);
  const blinkieDropdownRef = useRef<HTMLDivElement>(null);

  // Upload state for fan art
  const [uploadCaptchaToken, setUploadCaptchaToken] = useState<string | null>(null);
  const [showUploadCaptcha, setShowUploadCaptcha] = useState(false);
  const [uploadVerified, setUploadVerified] = useState(false);
  const uploadCaptchaRef = useRef<TurnstileInstance>(null);

  // Submission captcha
  const [submissionCaptchaToken, setSubmissionCaptchaToken] = useState<string | null>(null);
  const [showSubmissionCaptcha, setShowSubmissionCaptcha] = useState(false);
  const submissionCaptchaRef = useRef<TurnstileInstance>(null);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("password");
      setPassword("");
      setPasswordError("");
      setSubmitting(false);

      // Pre-populate form with message data
      const content = message.content;
      setEditForm({
        name: content.name || "",
        content: content.content || "",
        blinkies: content.blinkies || [],
        thumbnail: content.thumbnail || "",
        full_image: content.full_image || "",
        caption: content.caption || "",
        content_warning: content.content_warning || "",
      });

      // Parse content warnings for fan art
      if (message.type === "fan art" && content.content_warning) {
        const warnings = content.content_warning.split(", ");
        const knownWarnings = warnings.filter(w => CONTENT_WARNINGS.includes(w));
        const unknownWarnings = warnings.filter(w => !CONTENT_WARNINGS.includes(w));

        setSelectedContentWarnings(knownWarnings.length > 0 ? knownWarnings : []);
        setOtherContentWarning(unknownWarnings.length > 0 ? unknownWarnings[0] : "");

        if (unknownWarnings.length > 0) {
          setSelectedContentWarnings(prev => [...prev, "Other"]);
        }
      }

      // Set upload verified if image already exists
      if (content.thumbnail || content.full_image) {
        setUploadVerified(true);
      }
    }
  }, [isOpen, message]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        blinkieDropdownRef.current &&
        !blinkieDropdownRef.current.contains(event.target as Node)
      ) {
        setBlinkieDropdownOpen(false);
      }
    };

    if (blinkieDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [blinkieDropdownOpen]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    setPasswordError("");
    setStep("edit");
    setShowSubmissionCaptcha(true); // Show captcha for the final submission
  };

  const handleFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlinkieSelect = (url: string) => {
    setEditForm(prev => {
      const currentBlinkies = prev.blinkies || [];

      if (url === "") {
        return { ...prev, blinkies: [] };
      }

      if (currentBlinkies.includes(url)) {
        return { ...prev, blinkies: currentBlinkies.filter(b => b !== url) };
      } else if (currentBlinkies.length < 3) {
        return { ...prev, blinkies: [...currentBlinkies, url] };
      }

      return prev;
    });
  };

  const handleContentWarningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const warning = e.target.value;
    const isChecked = e.target.checked;

    setSelectedContentWarnings(prev => {
      if (isChecked) {
        return [...prev, warning];
      } else {
        return prev.filter(w => w !== warning);
      }
    });
  };

  const handleImageUploaded = (thumbnailUrl: string, fullImageUrl: string) => {
    setEditForm(prev => ({
      ...prev,
      thumbnail: thumbnailUrl,
      full_image: fullImageUrl,
    }));

    setUploadCaptchaToken(null);
    setShowUploadCaptcha(false);
    if (uploadCaptchaRef.current?.reset) {
      uploadCaptchaRef.current.reset();
    }
  };

  const handleUploadButtonClick = () => {
    setShowUploadCaptcha(true);
  };

  const handleUploadCaptchaSuccess = (token: string) => {
    setUploadCaptchaToken(token);
    setUploadVerified(true);
  };

  const handleSubmissionCaptchaSuccess = (token: string) => {
    setSubmissionCaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!submissionCaptchaToken) {
      alert("Please complete the CAPTCHA verification");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare content warnings for fan art
      let contentWarningString = "";
      if (message.type === "fan art") {
        const allContentWarnings = [...selectedContentWarnings];
        if (selectedContentWarnings.includes("Other") && otherContentWarning.trim()) {
          const index = allContentWarnings.indexOf("Other");
          allContentWarnings[index] = otherContentWarning.trim();
        } else if (!selectedContentWarnings.includes("Other") && otherContentWarning.trim()) {
          allContentWarnings.push(otherContentWarning.trim());
        } else if (selectedContentWarnings.includes("Other") && !otherContentWarning.trim()) {
          allContentWarnings.splice(allContentWarnings.indexOf("Other"), 1);
        }
        contentWarningString = allContentWarnings.length > 0 ? allContentWarnings.join(", ") : "";
      }

      const updateData = {
        content: {
          ...editForm,
          content_warning: message.type === "fan art" ? contentWarningString : undefined,
        },
        password: password,
        captchaToken: submissionCaptchaToken,
      };

      const response = await fetch(`${apiBaseUrl}/messages/${message.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update message");
      }

      onSuccess();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update message");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>Edit {message.type}</h2>
          <ButtonWrapper onClick={onClose} className="close-button">
            ✕
          </ButtonWrapper>
        </div>

        <div className="edit-modal-content">
          {step === "password" ? (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="edit-password">Enter password to edit:</label>
                <input
                  type="password"
                  id="edit-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                {passwordError && (
                  <div className="error-message">{passwordError}</div>
                )}
              </div>
              <ButtonWrapper onClick={() => {}} className="submit-button">
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    font: "inherit",
                    cursor: "inherit",
                    padding: 0,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  Verify Password
                </button>
              </ButtonWrapper>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="edit-name">Display name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editForm.name || ""}
                  onChange={handleFormInputChange}
                />
              </div>

              {message.type === "note" ? (
                <>
                  <div className="form-group">
                    <label>Blinkies (optional, max 3)</label>
                    <div className="blinkie-dropdown" ref={blinkieDropdownRef}>
                      <div
                        className="blinkie-dropdown-trigger"
                        onClick={() => setBlinkieDropdownOpen(!blinkieDropdownOpen)}
                      >
                        {(editForm.blinkies || []).length > 0 ? (
                          <div className="selected-blinkies">
                            {(editForm.blinkies || []).map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Selected blinkie ${index + 1}`}
                                className="selected-blinkie"
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="blinkie-placeholder">Select blinkies</span>
                        )}
                        <span className="dropdown-arrow">▼</span>
                      </div>
                      {blinkieDropdownOpen && (
                        <div className="blinkie-dropdown-menu">
                          <div
                            className="blinkie-option"
                            onClick={() => handleBlinkieSelect("")}
                          >
                            <span>Clear all</span>
                          </div>
                          {BLINKIES.map((url, index) => {
                            const isSelected = (editForm.blinkies || []).includes(url);
                            const canSelect = !isSelected && (editForm.blinkies || []).length < 3;
                            return (
                              <div
                                key={index}
                                className={`blinkie-option ${isSelected ? "selected" : ""} ${
                                  !canSelect && !isSelected ? "disabled" : ""
                                }`}
                                onClick={() => handleBlinkieSelect(url)}
                                style={{
                                  opacity: !canSelect && !isSelected ? 0.5 : 1,
                                }}
                              >
                                <img
                                  src={url}
                                  alt={`Blinkie ${index + 1}`}
                                  className="blinkie-preview"
                                />
                                {isSelected && (
                                  <span className="selection-indicator">✓</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-content">Message *</label>
                    <textarea
                      id="edit-content"
                      name="content"
                      value={editForm.content || ""}
                      onChange={handleFormInputChange}
                      required
                      rows={4}
                      maxLength={150}
                    />
                    <div className="character-counter">
                      {(editForm.content || "").length}/150
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Fan art image</label>
                    {!uploadVerified ? (
                      <div>
                        {!showUploadCaptcha ? (
                          <button
                            type="button"
                            onClick={handleUploadButtonClick}
                            className="upload-trigger-button"
                            disabled={submitting}
                          >
                            Upload new image
                          </button>
                        ) : (
                          <Turnstile
                            ref={uploadCaptchaRef}
                            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                            onSuccess={handleUploadCaptchaSuccess}
                            onError={() => {
                              setUploadCaptchaToken(null);
                              setShowUploadCaptcha(false);
                            }}
                            onExpire={() => {
                              setUploadCaptchaToken(null);
                              setShowUploadCaptcha(false);
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <ImageUploadInput
                        onImageUploaded={handleImageUploaded}
                        disabled={submitting}
                        captchaToken={uploadCaptchaToken}
                      />
                    )}
                    {editForm.thumbnail && (
                      <div className="current-image">
                        <img src={editForm.thumbnail} alt="Current image" style={{ maxWidth: "200px" }} />
                        <p>Current image (upload new one to replace)</p>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-caption">Caption</label>
                    <input
                      type="text"
                      id="edit-caption"
                      name="caption"
                      value={editForm.caption || ""}
                      onChange={handleFormInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Content warning (optional)</label>
                    <div className="content-warning-checkboxes">
                      {CONTENT_WARNINGS.map((warning, index) => {
                        const checkboxId = `edit-content-warning-${index}`;
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
                          id="edit-content-warning-other"
                          type="checkbox"
                          value="Other"
                          checked={selectedContentWarnings.includes("Other")}
                          onChange={handleContentWarningChange}
                        />
                        <label htmlFor="edit-content-warning-other">Other</label>
                      </div>
                    </div>
                    {selectedContentWarnings.includes("Other") && (
                      <input
                        type="text"
                        placeholder="Specify other content warning..."
                        value={otherContentWarning}
                        onChange={e => setOtherContentWarning(e.target.value)}
                      />
                    )}
                  </div>
                </>
              )}

              {!showSubmissionCaptcha ? (
                <div className="captcha-placeholder">
                  <p>CAPTCHA verification required for submission</p>
                </div>
              ) : (
                <div className="form-group">
                  <Turnstile
                    ref={submissionCaptchaRef}
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={handleSubmissionCaptchaSuccess}
                    onError={() => setSubmissionCaptchaToken(null)}
                    onExpire={() => setSubmissionCaptchaToken(null)}
                  />
                </div>
              )}

              <div className="form-actions">
                <ButtonWrapper
                  onClick={onClose}
                  className="cancel-button"
                  disabled={submitting}
                >
                  Cancel
                </ButtonWrapper>
                <ButtonWrapper
                  onClick={() => {}} // Form submission handled by onSubmit
                  className="submit-button"
                  disabled={
                    submitting ||
                    !submissionCaptchaToken ||
                    (message.type === "note" && !editForm.content?.trim())
                  }
                >
                  <button
                    type="submit"
                    style={{
                      background: "none",
                      border: "none",
                      color: "inherit",
                      font: "inherit",
                      cursor: "inherit",
                      padding: 0,
                      width: "100%",
                      height: "100%",
                    }}
                    disabled={
                      submitting ||
                      !submissionCaptchaToken ||
                      (message.type === "note" && !editForm.content?.trim())
                    }
                  >
                    {submitting ? "Updating..." : "Update"}
                  </button>
                </ButtonWrapper>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditMessageModal;