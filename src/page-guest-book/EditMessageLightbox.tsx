import React, { useState, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import Lightbox from "../common-components/Lightbox";
import ButtonWrapper from "../common-components/ButtonWrapper";
import GuestBookNoteForm from "./GuestBookNoteForm";
import GuestBookFanArtForm from "./GuestBookFanArtForm";
import type { Message, MessageContent } from "./types";
import { apiBaseUrl } from "../helpers/constants";
import "./EditMessageLightbox.css";

interface EditMessageLightboxProps {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditMessageLightbox: React.FC<EditMessageLightboxProps> = ({
  message,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"password" | "edit">("password");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  // Submission captcha
  const [submissionCaptchaToken, setSubmissionCaptchaToken] = useState<
    string | null
  >(null);
  const [showSubmissionCaptcha, setShowSubmissionCaptcha] = useState(false);
  const submissionCaptchaRef = useRef<TurnstileInstance>(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setStep("password");
      setPassword("");
      setPasswordError("");
      setSubmitting(false);
      setVerifyingPassword(false);
      setSubmissionCaptchaToken(null);
      setShowSubmissionCaptcha(false);
    }
  }, [isOpen, message]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    setPasswordError("");
    setVerifyingPassword(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/messages/${message.id}/verify-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (response.ok && data.valid) {
        // Password is correct, proceed to edit step
        setStep("edit");
        setShowSubmissionCaptcha(true); // Show captcha for the final submission
      } else {
        // Password verification failed
        if (response.status === 429) {
          setPasswordError(
            "Too many password verification attempts. Please try again later."
          );
        } else {
          setPasswordError(
            data.error || "Invalid password or message not found"
          );
        }
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setPasswordError("Failed to verify password. Please try again.");
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleSubmissionCaptchaSuccess = (token: string) => {
    setSubmissionCaptchaToken(token);
  };

  const handleFormSubmit = async (messageContent: MessageContent) => {
    if (!submissionCaptchaToken) {
      alert("Please complete the CAPTCHA verification");
      return;
    }

    setSubmitting(true);

    try {
      const updateData = {
        content: messageContent,
        password: password,
        captchaToken: submissionCaptchaToken,
      };

      const response = await fetch(`${apiBaseUrl}/messages/${message.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update message");
      }

      onSuccess();
      onClose();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to update message"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Lightbox
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={step === "password"}
    >
      <div className="div-3d-with-shadow edit-message-lightbox">
        {step === "password" ? (
          <div className="password-step">
            <div className="edit-header">
              <h2>Edit {message.type}</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="edit-password">The password is:</label>
                <input
                  type="password"
                  id="edit-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  disabled={verifyingPassword}
                />
                {passwordError && (
                  <div className="error-message">{passwordError}</div>
                )}
              </div>
              <ButtonWrapper
                onClick={() => {}}
                className="submit-button"
                disabled={verifyingPassword}
              >
                <button type="submit" disabled={verifyingPassword}>
                  {verifyingPassword ? "Verifying..." : "Verify Password"}
                </button>
              </ButtonWrapper>
            </form>
          </div>
        ) : (
          <div className="edit-step">
            <div className="edit-header">
              <h2>Edit {message.type}</h2>
            </div>

            <div className="edit-content">
              {/* Show CAPTCHA first */}
              {!showSubmissionCaptcha ? (
                <div className="captcha-placeholder">
                  <p>CAPTCHA verification required for submission</p>
                </div>
              ) : !submissionCaptchaToken ? (
                <div className="captcha-section">
                  <label>Complete CAPTCHA to proceed:</label>
                  <Turnstile
                    ref={submissionCaptchaRef}
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={handleSubmissionCaptchaSuccess}
                    onError={() => setSubmissionCaptchaToken(null)}
                    onExpire={() => setSubmissionCaptchaToken(null)}
                  />
                </div>
              ) : /* Show appropriate form based on message type */
              message.type === "note" ? (
                <GuestBookNoteForm
                  onSubmit={handleFormSubmit}
                  submitting={submitting}
                  showForm={true} // Always show in edit mode
                  onToggle={() => {}} // Not used in edit mode
                  isEditMode={true}
                  initialData={{
                    name: message.content.name || "",
                    content: message.content.content || "",
                    blinkies: message.content.blinkies || [],
                  }}
                  onCancel={handleCancel}
                />
              ) : (
                <GuestBookFanArtForm
                  onSubmit={handleFormSubmit}
                  submitting={submitting}
                  showForm={true} // Always show in edit mode
                  onToggle={() => {}} // Not used in edit mode
                  isEditMode={true}
                  initialData={{
                    name: message.content.name || "",
                    thumbnail: message.content.thumbnail || "",
                    full_image: message.content.full_image || "",
                    caption: message.content.caption || "",
                    content_warning: message.content.content_warning || "",
                  }}
                  onCancel={handleCancel}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Lightbox>
  );
};

export default EditMessageLightbox;
