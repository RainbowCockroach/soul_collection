import { useState, useEffect } from "react";

interface MessageContent {
  name: string;
  content: string;
  blinkie?: string;
  thumbnail?: string;
  full_image?: string;
  caption?: string;
}

interface Message {
  id: number;
  content: MessageContent;
  created_at: string;
  updated_at: string;
  expire_at: string;
  type: "note" | "fan art";
  password: string | null;
  uploaded_path: string | null;
}

const API_BASE_URL = "http://localhost:3002/api";

const PageGuestBook = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    type: "note" as "note" | "fan art",
    password: "",
    blinkie: "",
    thumbnail: "",
    full_image: "",
    caption: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/messages`);
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const messageContent: MessageContent = {
        name: formData.name,
        content: formData.content,
      };

      if (formData.blinkie) messageContent.blinkie = formData.blinkie;
      if (formData.thumbnail) messageContent.thumbnail = formData.thumbnail;
      if (formData.full_image) messageContent.full_image = formData.full_image;
      if (formData.caption) messageContent.caption = formData.caption;

      const payload: {
        content: MessageContent;
        type: "note" | "fan art";
        password?: string;
      } = {
        content: messageContent,
        type: formData.type,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(`${API_BASE_URL}/messages`, {
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

      // Reset form
      setFormData({
        name: "",
        content: "",
        type: "note",
        password: "",
        blinkie: "",
        thumbnail: "",
        full_image: "",
        caption: "",
      });

      // Refresh messages
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit message");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="page-padded">
      <h1>Guest Book</h1>

      {error && <div>Error: {error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="content">Message *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
          >
            <option value="note">Note</option>
            <option value="fan art">Fan Art</option>
          </select>
        </div>

        <div>
          <label htmlFor="password">
            Password (optional, for editing/deleting)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="blinkie">Blinkie URL (optional)</label>
          <input
            type="text"
            id="blinkie"
            name="blinkie"
            value={formData.blinkie}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="thumbnail">Thumbnail URL (optional)</label>
          <input
            type="text"
            id="thumbnail"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="full_image">Full Image URL (optional)</label>
          <input
            type="text"
            id="full_image"
            name="full_image"
            value={formData.full_image}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="caption">Caption (optional)</label>
          <input
            type="text"
            id="caption"
            name="caption"
            value={formData.caption}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Message"}
        </button>
      </form>

      <h2>Messages</h2>

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
    </div>
  );
};

export default PageGuestBook;
