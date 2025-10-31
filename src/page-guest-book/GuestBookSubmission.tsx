import { useState, useEffect, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import ImageUploadInput from "../common-components/ImageUploadInput";
import type { MessageContent } from "./types";
import "./GuestBookSubmission.css";

interface GuestBookSubmissionProps {
  onSubmit: (
    messageContent: MessageContent,
    type: "note" | "fan art",
    password?: string,
    captchaToken?: string
  ) => Promise<void>;
  submitting?: boolean;
}

// Dummy blinkie URLs for demonstration (using placeholder images)
const DUMMY_BLINKIES = [
  "https://adriansblinkiecollection.neocities.org/b47.gif",
  "https://adriansblinkiecollection.neocities.org/b47.gif",
  "https://adriansblinkiecollection.neocities.org/b47.gif",
  "https://adriansblinkiecollection.neocities.org/b47.gif",
  "https://adriansblinkiecollection.neocities.org/b47.gif",
];

const GuestBookSubmission = ({
  onSubmit,
  submitting = false,
}: GuestBookSubmissionProps) => {
  // Note form state
  const [noteForm, setNoteForm] = useState({
    name: "",
    content: "",
    blinkie: "",
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

  // Fan art form state
  const [fanArtForm, setFanArtForm] = useState({
    name: "",
    thumbnail: "",
    full_image: "",
    caption: "",
    password: "",
  });

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
      name: noteForm.name,
      content: noteForm.content,
      blinkie: noteForm.blinkie || undefined,
    };

    await onSubmit(messageContent, "note", noteForm.password || undefined);

    // Reset form on successful submission
    setNoteForm({
      name: "",
      content: "",
      blinkie: "",
      password: "",
    });
  };

  const handleFanArtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const messageContent: MessageContent = {
      name: fanArtForm.name,
      content: fanArtForm.caption || "Fan art submission",
      thumbnail: fanArtForm.thumbnail || undefined,
      full_image: fanArtForm.full_image || undefined,
      caption: fanArtForm.caption || undefined,
    };

    await onSubmit(messageContent, "fan art", fanArtForm.password || undefined);

    // Reset form on successful submission
    setFanArtForm({
      name: "",
      thumbnail: "",
      full_image: "",
      caption: "",
      password: "",
    });
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

    // Reset upload CAPTCHA after successful upload
    setUploadCaptchaToken(null);
    setShowUploadCaptcha(false);
    setUploadVerified(false);
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
    setNoteForm((prev) => ({
      ...prev,
      blinkie: url,
    }));
    setBlinkieDropdownOpen(false);
  };

  return (
    <div className="guest-book-submission">
      <h2>Wanna leave something here?</h2>

      <div className="forms-container">
        <div className="form-container note-form-container">
          <h3>Send note</h3>
          <form onSubmit={handleNoteSubmit} className="note-form">
            <div className="form-row">
              <div className="form-group name-group">
                <label htmlFor="note-name">Display name (optional)</label>
                <input
                  type="text"
                  id="note-name"
                  name="name"
                  value={noteForm.name}
                  onChange={handleNoteInputChange}
                  required
                />
              </div>

              <div className="form-group blinkie-group">
                <label>Blinkie (optional)</label>
                <div className="blinkie-dropdown" ref={blinkieDropdownRef}>
                  <div
                    className="blinkie-dropdown-trigger"
                    onClick={() => setBlinkieDropdownOpen(!blinkieDropdownOpen)}
                  >
                    {noteForm.blinkie ? (
                      <img
                        src={noteForm.blinkie}
                        alt="Selected blinkie"
                        className="selected-blinkie"
                      />
                    ) : (
                      <span className="blinkie-placeholder">
                        Select a blinkie
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
                        <span>None</span>
                      </div>
                      {DUMMY_BLINKIES.map((url, index) => (
                        <div
                          key={index}
                          className="blinkie-option"
                          onClick={() => handleBlinkieSelect(url)}
                        >
                          <img
                            src={url}
                            alt={`Blinkie ${index + 1}`}
                            className="blinkie-preview"
                          />
                        </div>
                      ))}
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
                type="password"
                id="note-password"
                name="password"
                value={noteForm.password}
                onChange={handleNoteInputChange}
                placeholder="*don't set me as 123456 :)*"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="submit-button"
            >
              {submitting ? "Submitting..." : "Send!"}
            </button>
          </form>
        </div>

        <div className="form-container fanart-form-container">
          <h3>Send fan art</h3>
          <form onSubmit={handleFanArtSubmit} className="fan-art-form">
            <div className="form-group">
              <label htmlFor="fanart-name">Display name (optional)</label>
              <input
                type="text"
                id="fanart-name"
                name="name"
                value={fanArtForm.name}
                onChange={handleFanArtInputChange}
                required
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
              <label htmlFor="fanart-password">
                Password (for edit/delete later, optional!)
              </label>
              <input
                type="password"
                id="fanart-password"
                name="password"
                value={fanArtForm.password}
                onChange={handleFanArtInputChange}
                placeholder="*don't set me as 123456 :)*"
              />
            </div>

            <button
              type="submit"
              disabled={
                submitting || (!fanArtForm.thumbnail && !fanArtForm.full_image)
              }
              className="submit-button"
            >
              {submitting ? "Submitting..." : "Send!"}
            </button>
          </form>
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
