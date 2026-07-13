import { useState, useEffect, useRef } from "react";
import ButtonWrapper from "../common-components/ButtonWrapper";
import GifSelector from "./GifSelector";
import type { MessageContent } from "./types";
import blinkies from "../data/guestbook-blinkies.json";
import { SUCCESS_MESSAGE_DURATION_MS } from "../helpers/constants";
import buttonSound from "/sound-effect/button_gallery_item.mp3";
import buttonSoundHover from "/sound-effect/button_hover.mp3";

interface GuestBookNoteFormProps {
  onSubmit: (
    messageContent: MessageContent,
    type: "note" | "fan art",
    password?: string | null,
    captchaToken?: string
  ) => Promise<void>;
  submitting?: boolean;
  // Called after a successful (non-edit) submission — used to close the dialog.
  onSuccess?: () => void;
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
  onSuccess,
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
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

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

      // Discord notification is sent server-side on message creation.

      // Reset form on successful submission
      setNoteForm({
        name: "",
        content: "",
        blinkies: [],
        password: "",
      });

      // Show success message
      setShowSuccessMessage(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setShowSuccessMessage(false);
      }, SUCCESS_MESSAGE_DURATION_MS);

      // In dialog (create) mode, let the parent close the dialog.
      if (!isEditMode) onSuccess?.();
    } catch {
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

  return (
    <form onSubmit={handleNoteSubmit} className="guest-book-form">
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

      <div className="form-actions">
        {onCancel && (
          <ButtonWrapper
            onClick={onCancel}
            soundFile={buttonSound}
            hoverSoundFile={buttonSoundHover}
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
          soundFile={buttonSound}
          hoverSoundFile={buttonSoundHover}
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
        <div className="gb-success-banner">
          ✓{" "}
          {isEditMode
            ? "Note updated successfully!"
            : "Note sent successfully!"}
        </div>
      )}
    </form>
  );
};

export default GuestBookNoteForm;
