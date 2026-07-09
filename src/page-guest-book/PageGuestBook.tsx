import { useState, useRef } from "react";
import GuestBookNoteSection, {
  type GuestBookNoteSectionRef,
} from "./GuestBookNoteSection";
import GuestBookFanArtSection, {
  type GuestBookFanArtSectionRef,
} from "./GuestBookFanArtSection";
import GuestBookNoteForm from "./GuestBookNoteForm";
import GuestBookFanArtForm from "./GuestBookFanArtForm";
import FullscreenImageViewer from "./FullscreenImageViewer";
import Lightbox from "../common-components/Lightbox";
import Divider from "../common-components/Divider";
import ButtonWrapper from "../common-components/ButtonWrapper";
import {
  DoodleCanvas,
  type DoodleCanvasHandle,
} from "./doodle-canvas/DoodleCanvas";
import type { MessageContent, Message } from "./types";
import { apiBaseUrl } from "../helpers/constants";
import { useIsMobile } from "../helpers/useIsMobile";
import buttonSendNote from "../assets/button_send_note.gif";
import buttonSendArt from "../assets/button_send_art.gif";
import buttonSoundGallery from "/sound-effect/button_gallery_item.mp3";
import "./PageGuestBook.css";
import "./GuestBookSubmission.css";

const PageGuestBook = () => {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Mobile lays notes/fan art out as a single row of 3; desktop keeps the 2x2
  // grid, so page in the matching count of items per view.
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 3 : 4;

  // Refs for section components
  const noteSectionRef = useRef<GuestBookNoteSectionRef>(null);
  const fanArtSectionRef = useRef<GuestBookFanArtSectionRef>(null);

  // Persistent doodle canvas (drives the "Send art" flow)
  const doodleRef = useRef<DoodleCanvasHandle>(null);

  // Submission dialogs
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [artDialogOpen, setArtDialogOpen] = useState(false);
  // PNG exported from the canvas when "Send art" is pressed.
  const [artImageDataUrl, setArtImageDataUrl] = useState<string | null>(null);
  // Inline hint shown by the "Send art" button (e.g. empty canvas).
  const [artHint, setArtHint] = useState<string | null>(null);

  // Fullscreen viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerMessage, setViewerMessage] = useState<Message | null>(null);

  const handleOpenFullscreenViewer = (message: Message) => {
    setViewerMessage(message);
    setViewerOpen(true);
  };

  const handleCloseFullscreenViewer = () => {
    setViewerOpen(false);
    setViewerMessage(null);
  };

  // Shared submit handler used by both dialogs. Posts the message and refreshes
  // both sections so the new submission appears.
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
      throw err; // Re-throw so the form can handle it
    } finally {
      setSubmitting(false);
    }
  };

  // "Send note": open the note dialog.
  const handleOpenNoteDialog = () => {
    setNoteDialogOpen(true);
  };

  // "Send art": export the current drawing to PNG and open the art dialog. The
  // exported PNG becomes the form's image input.
  const handleSendArt = async () => {
    setArtHint(null);
    const empty = await doodleRef.current?.isEmpty();
    if (empty !== false) {
      setArtHint("Draw something on the canvas first!");
      return;
    }
    try {
      const dataUrl = await doodleRef.current!.exportPng();
      setArtImageDataUrl(dataUrl);
      setArtDialogOpen(true);
    } catch {
      setArtHint("Couldn't read your drawing. Please try again.");
    }
  };

  const closeArtDialog = () => {
    setArtDialogOpen(false);
    setArtImageDataUrl(null);
  };

  // After art is successfully sent, wipe the canvas and close the dialog.
  const handleArtSuccess = () => {
    doodleRef.current?.clear();
    closeArtDialog();
  };

  return (
    <div className="page-padded guest-book-page">
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>Error: {error}</div>
      )}

      <div className="gb-layout">
        <h2 className="gb-title big-text-shadow">Leave something here!</h2>

        <div className="gb-note-button gb-send-button">
          <ButtonWrapper
            onClick={handleOpenNoteDialog}
            soundFile={buttonSoundGallery}
            className="gb-send-btn-wrapper"
            ariaHasPopup="dialog"
          >
            <img
              src={buttonSendNote}
              alt="Send a note"
              className="div-3d-with-shadow"
            />
          </ButtonWrapper>
        </div>

        <div className="gb-notes">
          <GuestBookNoteSection ref={noteSectionRef} notesPerPage={itemsPerPage} />
        </div>

        <div className="gb-divider">
          <Divider />
        </div>

        <div className="gb-canvas">
          <DoodleCanvas ref={doodleRef} showExportPreview={false} />
        </div>

        <div className="gb-art-button gb-send-button">
          <ButtonWrapper
            onClick={handleSendArt}
            soundFile={buttonSoundGallery}
            className="gb-send-btn-wrapper"
            ariaHasPopup="dialog"
          >
            <img
              src={buttonSendArt}
              alt="Send your art"
              className="div-3d-with-shadow"
            />
          </ButtonWrapper>
          {artHint && <p className="gb-art-hint">{artHint}</p>}
        </div>

        <div className="gb-art">
          <GuestBookFanArtSection
            ref={fanArtSectionRef}
            fanArtPerPage={itemsPerPage}
            onOpenFullscreenViewer={handleOpenFullscreenViewer}
          />
        </div>
      </div>

      {/* Note submission dialog */}
      <Lightbox
        isOpen={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        ariaLabel="Leave a note"
      >
        <div className="guest-book-submission gb-dialog">
          <h2 className="gb-dialog-title">Leave a note</h2>
          <div className="gb-dialog-divider">
            <Divider />
          </div>
          <GuestBookNoteForm
            onSubmit={handleFormSubmit}
            submitting={submitting}
            onCancel={() => setNoteDialogOpen(false)}
            onSuccess={() => setNoteDialogOpen(false)}
          />
        </div>
      </Lightbox>

      {/* Fan art submission dialog */}
      <Lightbox
        isOpen={artDialogOpen}
        onClose={closeArtDialog}
        ariaLabel="Send your art"
      >
        <div className="guest-book-submission gb-dialog">
          <h2 className="gb-dialog-title">Send your art</h2>
          <div className="gb-dialog-divider">
            <Divider />
          </div>
          <GuestBookFanArtForm
            onSubmit={handleFormSubmit}
            submitting={submitting}
            imageDataUrl={artImageDataUrl ?? undefined}
            onCancel={closeArtDialog}
            onSuccess={handleArtSuccess}
          />
        </div>
      </Lightbox>

      {/* Fullscreen Image Viewer */}
      {viewerMessage && (
        <FullscreenImageViewer
          src={
            viewerMessage.content.full_image ||
            viewerMessage.content.thumbnail ||
            ""
          }
          alt={`By ${viewerMessage.content.name}`}
          caption={viewerMessage.content.caption || undefined}
          isOpen={viewerOpen}
          onClose={handleCloseFullscreenViewer}
        />
      )}
    </div>
  );
};

export default PageGuestBook;
