import { useState, useEffect } from "react";
import ButtonWrapper from "../common-components/ButtonWrapper";
import GifSelector from "./GifSelector";
import type { MessageContent } from "./types";
import blinkies from "../data/guestbook-blinkies.json";
import buttonSendNote from "../assets/button_send_note.gif";
import buttonSoundGallery from "/sound-effect/button_gallery_item.mp3";
import { notifyNewGuestBookEntry } from "../helpers/discord-notify";

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

  // Success message state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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

    try {
      await onSubmit(messageContent, "note", noteForm.password || null);

      // Send Discord notification for new submissions (not edits)
      if (!isEditMode) {
        notifyNewGuestBookEntry("note", noteForm.name || "Anonymous").catch(
          (err) => {
            console.error("Discord notification failed:", err);
          }
        );
      }

      // Reset form on successful submission
      setNoteForm({
        name: "",
        content: "",
        blinkies: [],
        password: "",
      });

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

  const handleBlinkiesChange = (newBlinkies: string[]) => {
    setNoteForm((prev) => ({
      ...prev,
      blinkies: newBlinkies,
    }));
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
            <GifSelector
              availableGifs={BLINKIES}
              selectedGifs={noteForm.blinkies}
              onSelectionChange={handleBlinkiesChange}
              maxSelection={3}
              label="Blinkies (optional, max 3)"
            />
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
            ✓ {isEditMode ? "Note updated successfully!" : "Note sent successfully!"}
          </div>
        )}
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
              <GifSelector
                availableGifs={BLINKIES}
                selectedGifs={noteForm.blinkies}
                onSelectionChange={handleBlinkiesChange}
                maxSelection={3}
                label="Blinkies (optional, max 3)"
              />
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
              ✓ Note sent successfully!
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default GuestBookNoteForm;
