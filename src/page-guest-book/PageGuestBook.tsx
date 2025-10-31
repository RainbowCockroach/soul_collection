import { useState, useEffect } from "react";
import GuestBookSubmission from "./GuestBookSubmission";
import GuestBookNoteSection from "./GuestBookNoteSection";
import type { MessageContent, Message } from "./types";
import { apiBaseUrl } from "../helpers/constants";

const PageGuestBook = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/messages`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle submission from new GuestBookSubmission component
  const handleFormSubmit = async (
    messageContent: MessageContent,
    type: "note" | "fan art",
    password?: string,
    captchaToken?: string
  ) => {
    setSubmitting(true);

    try {
      const payload: {
        content: MessageContent;
        type: "note" | "fan art";
        password?: string;
        captchaToken?: string;
      } = {
        content: messageContent,
        type: type,
      };

      if (password) {
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

      // Refresh messages
      await fetchMessages();
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

      {loading ? (
        <div>Loading messages...</div>
      ) : (
        <div>
          {messages.length === 0 ? (
            <p>No messages yet. Be the first to leave one!</p>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                <h3>{message.content.name}</h3>
                <p>{message.content.content}</p>
                <p>
                  Type: {message.type} | Posted:{" "}
                  {new Date(message.created_at).toLocaleString()}
                </p>
                {message.content.blinkie && (
                  <img src={message.content.blinkie} alt="Blinkie" />
                )}
                {message.content.thumbnail && (
                  <img src={message.content.thumbnail} alt="Thumbnail" />
                )}
                {message.content.full_image && (
                  <img
                    src={message.content.full_image}
                    alt={message.content.caption || "Full image"}
                  />
                )}
                {message.content.caption && <p>{message.content.caption}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* New GuestBookSubmission component */}
      <GuestBookSubmission
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default PageGuestBook;
