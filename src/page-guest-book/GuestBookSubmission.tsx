import { useState } from "react";
import type { MessageContent } from "./types";
import "./GuestBookSubmission.css";
import GuestBookNoteForm from "./GuestBookNoteForm";
import GuestBookFanArtForm from "./GuestBookFanArtForm";

interface GuestBookSubmissionProps {
  onSubmit: (
    messageContent: MessageContent,
    type: "note" | "fan art",
    password?: string | null,
    captchaToken?: string
  ) => Promise<void>;
  submitting?: boolean;
}

const GuestBookSubmission = ({
  onSubmit,
  submitting = false,
}: GuestBookSubmissionProps) => {
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showFanArtForm, setShowFanArtForm] = useState(false);

  const isMobile = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  const handleNoteToggle = () => {
    const next = !showNoteForm;
    setShowNoteForm(next);
    if (next && isMobile()) {
      setShowFanArtForm(false);
    }
  };

  const handleFanArtToggle = () => {
    const next = !showFanArtForm;
    setShowFanArtForm(next);
    if (next && isMobile()) {
      setShowNoteForm(false);
    }
  };

  return (
    <div className="guest-book-submission">
      <h2 className="big-text-shadow">Wanna leave something here?</h2>

      <div className="forms-container">
        <GuestBookNoteForm
          onSubmit={onSubmit}
          submitting={submitting}
          showForm={showNoteForm}
          onToggle={handleNoteToggle}
        />

        <GuestBookFanArtForm
          onSubmit={onSubmit}
          submitting={submitting}
          showForm={showFanArtForm}
          onToggle={handleFanArtToggle}
        />
      </div>

      {/* <p className="disclaimer">
        Your note will be displayed on the guestbook for 30 days <br />
        Creations will be displayed at random
      </p> */}
    </div>
  );
};

export default GuestBookSubmission;
