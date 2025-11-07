import { useState } from "react";
import GuestBookSubmission from "./GuestBookSubmission";
import GuestBookNoteSection from "./GuestBookNoteSection";
import GuestBookFanArtSection from "./GuestBookFanArtSection";
import type { MessageContent } from "./types";
import { apiBaseUrl } from "../helpers/constants";

const PageGuestBook = () => {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      <GuestBookNoteSection notesPerPage={4} />

      {/* Fan Art Section */}
      <GuestBookFanArtSection fanArtPerPage={4} />

      {/* New GuestBookSubmission component */}
      <GuestBookSubmission
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default PageGuestBook;
