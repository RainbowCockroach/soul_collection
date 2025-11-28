import { useState, useRef } from "react";
import GuestBookSubmission from "./GuestBookSubmission";
import GuestBookNoteSection, {
  type GuestBookNoteSectionRef,
} from "./GuestBookNoteSection";
import GuestBookFanArtSection, {
  type GuestBookFanArtSectionRef,
} from "./GuestBookFanArtSection";
import ButtonWrapper from "../common-components/ButtonWrapper";
import FullscreenImageViewer from "./FullscreenImageViewer";
import type { MessageContent, Message } from "./types";
import { apiBaseUrl } from "../helpers/constants";
import "./PageGuestBook.css";

const PageGuestBook = () => {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Refs for section components
  const noteSectionRef = useRef<GuestBookNoteSectionRef>(null);
  const fanArtSectionRef = useRef<GuestBookFanArtSectionRef>(null);

  // Fullscreen viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerMessage, setViewerMessage] = useState<Message | null>(null);

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Fullscreen viewer handlers
  const handleOpenFullscreenViewer = (message: Message) => {
    setViewerMessage(message);
    setViewerOpen(true);
  };

  const handleCloseFullscreenViewer = () => {
    setViewerOpen(false);
    setViewerMessage(null);
  };

  // Handle submission from new GuestBookSubmission component
  const handleFormSubmit = async (
    messageContent: MessageContent,
    type: "note" | "fan art",
    password?: string | null,
    captchaToken?: string
  ) => {
    setSubmitting(true);

    try {
      const payload: {
        content: MessageContent;
        type: "note" | "fan art";
        password?: string | null;
        captchaToken?: string;
      } = {
        content: messageContent,
        type: type,
      };

      if (password !== undefined) {
        payload.password = password;
      }

      if (captchaToken) {
        payload.captchaToken = captchaToken;
      }

      const response = await fetch(`${apiBaseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create message");
      }

      setError(null);

      // Refresh both sections to show the new submission
      noteSectionRef.current?.refresh();
      fanArtSectionRef.current?.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit message");
      throw err; // Re-throw so the component can handle it
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-padded">
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>Error: {error}</div>
      )}

      {/* Notes Section */}
      <GuestBookNoteSection
        ref={noteSectionRef}
        notesPerPage={4}
        editMode={editMode}
      />

      {/* Fan Art Section */}
      <GuestBookFanArtSection
        ref={fanArtSectionRef}
        fanArtPerPage={4}
        editMode={editMode}
        onOpenFullscreenViewer={handleOpenFullscreenViewer}
      />

      {/* New GuestBookSubmission component */}
      <GuestBookSubmission
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />

      {/* Edit Mode Toggle Button */}
      <ButtonWrapper
        onClick={toggleEditMode}
        className={`edit-mode-button ${editMode ? "active" : ""}`}
      >
        <div className="edit-button-content">
          <span className="edit-icon">{editMode ? "✓" : "✏️"}</span>
          <span>{editMode ? "Exit Edit Mode" : "Enter Edit Mode"}</span>
        </div>
      </ButtonWrapper>

      {/* Fullscreen Image Viewer */}
      {viewerMessage && (
        <FullscreenImageViewer
          src={
            viewerMessage.content.full_image ||
            viewerMessage.content.thumbnail ||
            ""
          }
          alt={`Fan art by ${viewerMessage.content.name}`}
          caption={viewerMessage.content.caption || undefined}
          isOpen={viewerOpen}
          onClose={handleCloseFullscreenViewer}
        />
      )}
    </div>
  );
};

export default PageGuestBook;
