import { useState, useEffect, useRef } from "react";
import ButtonWrapper from "../common-components/ButtonWrapper";
import type { MessageContent } from "./types";
import blinkies from "../data/guestbook-blinkies.json";
import buttonSendNote from "../assets/button_send_note.gif";
import buttonSoundGallery from "/sound-effect/button_gallery_item.mp3";

interface GuestBookNoteFormProps {
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
    content?: string;
    blinkies?: string[];
  };
  onCancel?: () => void;
}

const BLINKIES = blinkies as string[];

const GuestBookNoteForm = ({
  onSubmit,
  submitting = false,
  showForm,
  onToggle,
  isEditMode = false,
  initialData,
  onCancel,
}: GuestBookNoteFormProps) => {
  // Note form state
  const [noteForm, setNoteForm] = useState({
    name: isEditMode && initialData?.name ? initialData.name : "",
    content: isEditMode && initialData?.content ? initialData.content : "",
    blinkies: (isEditMode && initialData?.blinkies
      ? initialData.blinkies
      : []) as string[],
    password: "",
  });

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (isEditMode && initialData) {
      setNoteForm({
        name: initialData.name || "",
        content: initialData.content || "",
        blinkies: initialData.blinkies || [],
        password: "",
      });
    }
  }, [isEditMode, initialData]);

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
        return { ...prev, blinkies: currentBlinkies.filter((b) => b !== url) };
      } else if (currentBlinkies.length < 3) {
        // Add if less than 3 selected
        return { ...prev, blinkies: [...currentBlinkies, url] };
      }

      // If 3 already selected, don't add more
      return prev;
    });
    // Keep dropdown open for multiple selections
  };

  // In edit mode, render form directly without container
  if (isEditMode) {
    return (
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
                onClick={() => setBlinkieDropdownOpen(!blinkieDropdownOpen)}
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
                    const isSelected = noteForm.blinkies.includes(url);
                    const canSelect =
                      !isSelected && noteForm.blinkies.length < 3;
                    return (
                      <div
                        key={index}
                        className={`blinkie-option ${
                          isSelected ? "selected" : ""
                        } ${!canSelect && !isSelected ? "disabled" : ""}`}
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
          <div className="character-counter">{noteForm.content.length}/150</div>
        </div>

        {!isEditMode && (
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
            disabled={submitting || !noteForm.content.trim()}
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
      </form>
    );
  }

  // Normal mode with toggle button and container
  return (
    <div className="form-container note-form-container">
      <ButtonWrapper
        className="form-toggle-button"
        onClick={onToggle}
        soundFile={buttonSoundGallery}
      >
        <img src={buttonSendNote} alt="Send" className="div-3d-with-shadow" />
      </ButtonWrapper>
      {showForm && (
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
                  onClick={() => setBlinkieDropdownOpen(!blinkieDropdownOpen)}
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
                      const isSelected = noteForm.blinkies.includes(url);
                      const canSelect =
                        !isSelected && noteForm.blinkies.length < 3;
                      return (
                        <div
                          key={index}
                          className={`blinkie-option ${
                            isSelected ? "selected" : ""
                          } ${!canSelect && !isSelected ? "disabled" : ""}`}
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

          {!isEditMode && (
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
              disabled={submitting || !noteForm.content.trim()}
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
        </form>
      )}
    </div>
  );
};

export default GuestBookNoteForm;
