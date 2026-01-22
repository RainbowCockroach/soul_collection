import React, { useState, useRef, useEffect } from "react";
import Lightbox from "../common-components/Lightbox";
import ButtonWrapper from "../common-components/ButtonWrapper";
import "./BugReportDialog.css";

interface BugReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AttachedImage {
  id: string;
  blob: Blob;
  previewUrl: string;
  name: string;
}

interface PersistedImage {
  id: string;
  dataUrl: string;
  name: string;
  type: string;
}

interface PersistedState {
  description: string;
  images: PersistedImage[];
}

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1463345410352611461/vqxXzAKmRQe1xp8jMot5lUOrGi3EejPRLBorAjOk0qVbRo_24Egx5canPWYQXDmKWbLc";

const STORAGE_KEY = "bug-report-draft";
const MAX_ATTACHMENTS = 10; // Discord webhook limit

const BugReportDialog: React.FC<BugReportDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<AttachedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Load persisted state on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const loadPersistedState = async () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const persisted: PersistedState = JSON.parse(stored);

        // Restore description
        if (persisted.description) {
          setDescription(persisted.description);
        }

        // Restore images - convert base64 data URLs back to blobs
        if (persisted.images && persisted.images.length > 0) {
          const restoredAttachments: AttachedImage[] = [];

          for (const img of persisted.images) {
            try {
              // Convert data URL to blob
              const response = await fetch(img.dataUrl);
              const blob = await response.blob();
              const previewUrl = URL.createObjectURL(blob);

              restoredAttachments.push({
                id: img.id,
                blob,
                previewUrl,
                name: img.name,
              });
            } catch (err) {
              console.error("Failed to restore image:", err);
            }
          }

          setAttachments(restoredAttachments);
        }
      } catch (err) {
        console.error("Failed to load persisted state:", err);
      }
    };

    loadPersistedState();
  }, []);

  // Persist state changes to sessionStorage
  useEffect(() => {
    if (!isInitialized.current) return;

    const persistState = async () => {
      try {
        const persistedImages: PersistedImage[] = [];

        // Convert blobs to base64 data URLs for storage
        for (const attachment of attachments) {
          try {
            const reader = new FileReader();
            const dataUrl = await new Promise<string>((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(attachment.blob);
            });

            persistedImages.push({
              id: attachment.id,
              dataUrl,
              name: attachment.name,
              type: attachment.blob.type,
            });
          } catch (err) {
            console.error("Failed to convert image to base64:", err);
          }
        }

        const stateToSave: PersistedState = {
          description,
          images: persistedImages,
        };

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.error("Failed to persist state:", err);
      }
    };

    persistState();
  }, [description, attachments]);

  const handleAttachImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: AttachedImage[] = [];
    const remainingSlots = MAX_ATTACHMENTS - attachments.length;

    Array.from(files).forEach((file, index) => {
      // Stop if we've reached the limit
      if (index >= remainingSlots) return;

      if (file.type.startsWith("image/")) {
        const blob = new Blob([file], { type: file.type });
        const previewUrl = URL.createObjectURL(blob);
        newAttachments.push({
          id: generateId(),
          blob,
          previewUrl,
          name: file.name,
        });
      }
    });

    setAttachments((prev) => [...prev, ...newAttachments]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const toRemove = prev.find((a) => a.id === id);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const parseUserAgent = (ua: string) => {
    // Detect browser
    let browser = "Unknown";
    let version = "";

    if (ua.includes("Edg/")) {
      browser = "Edge";
      version = ua.match(/Edg\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("OPR/") || ua.includes("Opera/")) {
      browser = "Opera";
      version = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Chrome/") && !ua.includes("Edg/")) {
      browser = "Chrome";
      version = ua.match(/Chrome\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
      browser = "Safari";
      version = ua.match(/Version\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Firefox/")) {
      browser = "Firefox";
      version = ua.match(/Firefox\/([\d.]+)/)?.[1] || "";
    }

    // Detect OS
    let os = "Unknown";
    if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
    else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
    else if (ua.includes("Windows NT 6.2")) os = "Windows 8";
    else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
    else if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS X")) {
      const match = ua.match(/Mac OS X ([\d_]+)/);
      if (match) {
        os = `macOS ${match[1].replace(/_/g, ".")}`;
      } else {
        os = "macOS";
      }
    } else if (ua.includes("Android")) {
      const match = ua.match(/Android ([\d.]+)/);
      os = match ? `Android ${match[1]}` : "Android";
    } else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) {
      const match = ua.match(/OS ([\d_]+)/);
      os = match ? `iOS ${match[1].replace(/_/g, ".")}` : "iOS";
    } else if (ua.includes("Linux")) {
      os = "Linux";
    }

    // Detect device type
    let deviceType = "Desktop";
    if (ua.includes("Mobile")) {
      deviceType = "Mobile";
    } else if (ua.includes("Tablet") || ua.includes("iPad")) {
      deviceType = "Tablet";
    }

    return {
      browser: version ? `${browser} ${version}` : browser,
      os,
      deviceType,
    };
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    const parsed = parseUserAgent(ua);

    // Detect touch support
    const hasTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      ("msMaxTouchPoints" in navigator && (navigator as { msMaxTouchPoints: number }).msMaxTouchPoints > 0);

    // Get device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;
    const pixelRatioLabel = pixelRatio > 1.5 ? `${pixelRatio} (Retina)` : `${pixelRatio}`;

    // Format browser info
    const browserInfo = [
      `**Browser Info:**`,
      `Browser: ${parsed.browser}`,
      `OS: ${parsed.os}`,
      `Device Type: ${parsed.deviceType}`,
      `Language: ${navigator.language}`,
      `Screen: ${window.innerWidth}x${window.innerHeight} (physical: ${screen.width}x${screen.height})`,
      `Pixel Ratio: ${pixelRatioLabel}`,
      `Touch Support: ${hasTouch ? "Yes" : "No"}`,
      ``,
      `Raw User Agent: ${ua}`,
    ].join("\n");

    return browserInfo;
  };

  const handleSubmit = async () => {
    if (!description.trim() && attachments.length === 0) {
      setSubmitError(
        "Please provide either a description or attach at least one image.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();

      // Add text content with [BUG REPORT] prefix and browser info
      const userDescription = description.trim() || "(No description provided)";
      const browserInfo = getBrowserInfo();
      const messageContent = `${userDescription}\n\n---\n${browserInfo}`;

      const payload = {
        content: messageContent,
        username: "BUG REPORT",
      };
      formData.append("payload_json", JSON.stringify(payload));

      // Add images as file attachments
      attachments.forEach((attachment, index) => {
        formData.append(`file${index}`, attachment.blob, attachment.name);
      });

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to send: ${response.status}`);
      }

      setSubmitSuccess(true);

      // Clear persisted state on successful submit
      sessionStorage.removeItem(STORAGE_KEY);

      // Reset form and close after short delay
      setTimeout(() => {
        clearForm();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Submit failed:", error);
      setSubmitError("Failed to send bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    // Cleanup preview URLs
    attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
    // Reset all state
    setDescription("");
    setAttachments([]);
    setSubmitError("");
    setSubmitSuccess(false);
  };

  const handleClose = () => {
    // Don't reset state - let it persist for when user reopens
    // Only clear error and success messages
    setSubmitError("");
    setSubmitSuccess(false);
    onClose();
  };

  // Handle clipboard paste for images
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      // Check if we've reached the attachment limit
      if (attachments.length >= MAX_ATTACHMENTS) {
        console.log(`Maximum ${MAX_ATTACHMENTS} attachments reached`);
        return;
      }

      // Look for image in clipboard
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.startsWith("image/")) {
          event.preventDefault();

          const blob = item.getAsFile();
          if (!blob) continue;

          // Check if adding this would exceed the limit
          if (attachments.length >= MAX_ATTACHMENTS) {
            break;
          }

          const previewUrl = URL.createObjectURL(blob);
          const timestamp = Date.now();
          const extension = blob.type.split("/")[1] || "png";

          setAttachments((prev) => [
            ...prev,
            {
              id: generateId(),
              blob,
              previewUrl,
              name: `pasted-${timestamp}.${extension}`,
            },
          ]);

          break; // Only process the first image found
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [isOpen, attachments.length]);

  return (
    <Lightbox isOpen={isOpen} onClose={handleClose}>
      <div className="bug-report-dialog-wrapper">
        <div className="div-3d-with-shadow bug-report-dialog">
          <h2 className="bug-report-title">Report a Bug</h2>

          {submitSuccess ? (
            <div className="success-message">
              Bug report sent successfully! Thank you for your feedback.
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="bug-description">
                  Describe the issue: (optional)
                </label>
                <textarea
                  id="bug-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? What did you expect to happen?"
                  rows={5}
                  disabled={isSubmitting}
                />
              </div>

              <div className="attachments-section">
                <label>
                  Attachments: (optional, max {MAX_ATTACHMENTS})
                  {attachments.length > 0 &&
                    ` - ${attachments.length}/${MAX_ATTACHMENTS}`}
                </label>
                {attachments.length > 0 && (
                  <div className="attachments-gallery">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="attachment-item">
                        <img
                          src={attachment.previewUrl}
                          alt={attachment.name}
                        />
                        <button
                          type="button"
                          className="remove-attachment"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="attachment-buttons">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAttachImages}
                    style={{ display: "none" }}
                  />
                  <ButtonWrapper
                    onClick={() => fileInputRef.current?.click()}
                    className="attach-button"
                    disabled={
                      isSubmitting || attachments.length >= MAX_ATTACHMENTS
                    }
                  >
                    Attach Image
                  </ButtonWrapper>
                </div>

                <p className="screenshot-hint">
                  Or you can close this pop up to take a screenshot and paste it
                  here after. Your stuff will still be here.
                </p>
              </div>

              {submitError && (
                <div className="error-message">{submitError}</div>
              )}

              <div className="form-actions">
                <ButtonWrapper
                  onClick={handleSubmit}
                  className="submit-button send-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </ButtonWrapper>
              </div>
            </>
          )}
        </div>
      </div>
    </Lightbox>
  );
};

export default BugReportDialog;
