import { useState, useEffect, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import ImageUploadInput from "../common-components/ImageUploadInput";
import type { MessageContent } from "./types";
import "./GuestBookSubmission.css";
import ButtonWrapper from "../common-components/ButtonWrapper";
import blinkies from "../data/guestbook-blinkies.json";
import buttonSendNote from "../assets/button_send_note.gif";

interface GuestBookSubmissionProps {
  onSubmit: (
    messageContent: MessageContent,
    type: "note" | "fan art",
    password?: string | null,
    captchaToken?: string
  ) => Promise<void>;
  submitting?: boolean;
}

const BLINKIES = blinkies as string[];
const CONTENT_WARNINGS = [
  "Genitals",
  "Nipples",
  "Gore",
  "Drugs",
  "Eldritch horror beyond comprehension",
];

const GuestBookSubmission = ({
  onSubmit,
  submitting = false,
}: GuestBookSubmissionProps) => {
  // Note form state
  const [noteForm, setNoteForm] = useState({
    name: "",
    content: "",
    blinkies: [] as string[],
    password: "",
  });

  // Upload captcha state
  const [uploadCaptchaToken, setUploadCaptchaToken] = useState<string | null>(
    null
  );
  const [showUploadCaptcha, setShowUploadCaptcha] = useState(false);
  const [uploadVerified, setUploadVerified] = useState(false);

  // Captcha ref for upload widget
  const uploadCaptchaRef = useRef<TurnstileInstance>(null);

  const [blinkieDropdownOpen, setBlinkieDropdownOpen] = useState(false);
  const blinkieDropdownRef = useRef<HTMLDivElement>(null);

  const [showNoteForm, setShowNoteForm] = useState(false);

  const [showFanArtForm, setShowFanArtForm] = useState(false);

  // Fan art form state
  const [fanArtForm, setFanArtForm] = useState({
    name: "",
    thumbnail: "",
    full_image: "",
    caption: "",
    password: "",
  });

  // Content warning multi-select state
  const [selectedContentWarnings, setSelectedContentWarnings] = useState<
    string[]
  >([]);
  // Other content warning text
  const [otherContentWarning, setOtherContentWarning] = useState<string>("");

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

  const handleNoteInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNoteForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFanArtInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFanArtForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const messageContent: MessageContent = {
      name: noteForm.name || null,
      content: noteForm.content || null,
      blinkies: noteForm.blinkies.length > 0 ? noteForm.blinkies : null,
    };

    await onSubmit(messageContent, "note", noteForm.password || null);

    // Reset form on successful submission
    setNoteForm({
      name: "",
      content: "",
      blinkies: [],
      password: "",
    });
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
    setUploadCaptchaToken(null);
    setShowUploadCaptcha(false);
    setUploadVerified(false);
    if (uploadCaptchaRef.current?.reset) {
      uploadCaptchaRef.current.reset();
    }
  };

  const handleImageUploaded = (thumbnailUrl: string, fullImageUrl: string) => {
    setFanArtForm((prev) => ({
      ...prev,
      thumbnail: thumbnailUrl,
      full_image: fullImageUrl,
    }));

    // Reset upload CAPTCHA token after successful upload, but keep upload verified
    // so user can continue to see the ImageUploadInput component
    setUploadCaptchaToken(null);
    setShowUploadCaptcha(false);
    // Note: We don't reset uploadVerified here to maintain the UI state
    if (uploadCaptchaRef.current?.reset) {
      uploadCaptchaRef.current.reset();
    }
  };

  const handleUploadButtonClick = () => {
    // Show CAPTCHA when user clicks the upload button
    setShowUploadCaptcha(true);
  };

  const handleUploadCaptchaSuccess = (token: string) => {
    setUploadCaptchaToken(token);
    setUploadVerified(true);
  };

  const handleBlinkieSelect = (url: string) => {
    setNoteForm((prev) => {
      const currentBlinkies = prev.blinkies;

      if (url === "") {
        // Clear all blinkies
        return { ...prev, blinkies: [] };
      }

      // Toggle blinkie selection
      if (currentBlinkies.includes(url)) {
        // Remove if already selected
        return { ...prev, blinkies: currentBlinkies.filter(b => b !== url) };
      } else if (currentBlinkies.length < 3) {
        // Add if less than 3 selected
        return { ...prev, blinkies: [...currentBlinkies, url] };
      }

      // If 3 already selected, don't add more
      return prev;
    });
    // Keep dropdown open for multiple selections
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

  return (
    <div className="guest-book-submission">
      <h2>Wanna leave something here?</h2>

      <div className="forms-container">
        <div className="form-container note-form-container">
          <ButtonWrapper
            className="div-3d-with-shadow form-toggle-button"
            onClick={() => setShowNoteForm(!showNoteForm)}
          >
            <h3>Send note</h3>
          </ButtonWrapper>
          {showNoteForm && (
            <form
              onSubmit={handleNoteSubmit}
              className="div-3d-with-shadow guest-book-form"
            >
              <div className="form-row">
                <div className="form-group name-group">
                  <label htmlFor="note-name">Display name (optional)</label>
                  <input
                    type="text"
                    id="note-name"
                    name="name"
                    value={noteForm.name}
                    onChange={handleNoteInputChange}
                  />
                </div>

                <div className="form-group blinkie-group">
                  <label>Blinkies (optional, max 3)</label>
                  <div className="blinkie-dropdown" ref={blinkieDropdownRef}>
                    <div
                      className="blinkie-dropdown-trigger"
                      onClick={() =>
                        setBlinkieDropdownOpen(!blinkieDropdownOpen)
                      }
                    >
                      {noteForm.blinkies.length > 0 ? (
                        <div className="selected-blinkies">
                          {noteForm.blinkies.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Selected blinkie ${index + 1}`}
                              className="selected-blinkie"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="blinkie-placeholder">
                          Select blinkies
                        </span>
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
                          const isSelected = noteForm.blinkies.includes(url);
                          const canSelect = !isSelected && noteForm.blinkies.length < 3;
                          return (
                            <div
                              key={index}
                              className={`blinkie-option ${isSelected ? 'selected' : ''} ${!canSelect && !isSelected ? 'disabled' : ''}`}
                              onClick={() => handleBlinkieSelect(url)}
                              style={{ opacity: (!canSelect && !isSelected) ? 0.5 : 1 }}
                            >
                              <img
                                src={url}
                                alt={`Blinkie ${index + 1}`}
                                className="blinkie-preview"
                              />
                              {isSelected && <span className="selection-indicator">✓</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="note-content">Message *</label>
                <textarea
                  id="note-content"
                  name="content"
                  value={noteForm.content}
                  onChange={handleNoteInputChange}
                  required
                  rows={4}
                  maxLength={150}
                />
                <div className="character-counter">
                  {noteForm.content.length}/150
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="note-password">
                  Password (for edit/delete later, optional!)
                </label>
                <input
                  type="text"
                  id="note-password"
                  name="password"
                  value={noteForm.password}
                  onChange={handleNoteInputChange}
                  placeholder="*don't set me as 123456 :)*"
                />
              </div>

              <ButtonWrapper
                type="submit"
                onClick={() => {}}
                disabled={submitting || !noteForm.content.trim()}
                className="submit-button"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <img
                    src={buttonSendNote}
                    alt="Send"
                    className="div-3d-with-shadow"
                  />
                )}
              </ButtonWrapper>
            </form>
          )}
        </div>

        <div className="form-container fanart-form-container">
          <ButtonWrapper
            className="div-3d-with-shadow form-toggle-button"
            onClick={() => setShowFanArtForm(!showFanArtForm)}
          >
            <h3>Send fan art</h3>
          </ButtonWrapper>
          {showFanArtForm && (
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
                {!uploadVerified ? (
                  <div>
                    {!showUploadCaptcha ? (
                      <button
                        type="button"
                        onClick={handleUploadButtonClick}
                        className="upload-trigger-button"
                        disabled={submitting}
                      >
                        Upload file
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

              <ButtonWrapper
                type="submit"
                onClick={() => {}}
                disabled={
                  submitting ||
                  (!fanArtForm.thumbnail && !fanArtForm.full_image)
                }
                className="submit-button"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <img
                    src={buttonSendNote}
                    alt="Send"
                    className="div-3d-with-shadow"
                  />
                )}
              </ButtonWrapper>
            </form>
          )}
        </div>
      </div>

      <p className="disclaimer">
        Your note will be displayed on the guestbook for 30 days <br />
        Creations will be displayed at random
      </p>
    </div>
  );
};

export default GuestBookSubmission;
