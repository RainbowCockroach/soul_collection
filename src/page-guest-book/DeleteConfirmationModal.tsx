import React, { useState, useRef, useEffect } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import ButtonWrapper from "../common-components/ButtonWrapper";
import type { Message } from "./types";
import { apiBaseUrl } from "../helpers/constants";
import "./DeleteConfirmationModal.css";

interface DeleteConfirmationModalProps {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  message,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"confirm" | "password">("confirm");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const captchaRef = useRef<TurnstileInstance>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setPassword("");
      setPasswordError("");
      setSubmitting(false);
      setCaptchaToken(null);
      setShowCaptcha(false);
      if (captchaRef.current?.reset) {
        captchaRef.current.reset();
      }
    }
  }, [isOpen]);

  const handleConfirmDelete = () => {
    setStep("password");
    setShowCaptcha(true);
  };

  const handleCaptchaSuccess = (token: string) => {
    setCaptchaToken(token);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    if (!captchaToken) {
      setPasswordError("Please complete the CAPTCHA verification");
      return;
    }

    setPasswordError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/messages/${message.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password,
          captchaToken: captchaToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete message");
      }

      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid password")) {
        setPasswordError("Invalid password");
      } else {
        setPasswordError(error instanceof Error ? error.message : "Failed to delete message");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (step === "password") {
      setStep("confirm");
      setPassword("");
      setPasswordError("");
      setCaptchaToken(null);
      setShowCaptcha(false);
      if (captchaRef.current?.reset) {
        captchaRef.current.reset();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={e => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h2>Delete {message.type}</h2>
          <ButtonWrapper onClick={onClose} className="close-button">
            ✕
          </ButtonWrapper>
        </div>

        <div className="delete-modal-content">
          {step === "confirm" ? (
            <div className="confirmation-step">
              <div className="warning-icon">⚠️</div>
              <h3>Are you sure you want to delete this {message.type}?</h3>
              <div className="message-preview">
                <p><strong>Author:</strong> {message.content.name || "Anonymous"}</p>
                {message.type === "note" ? (
                  <p><strong>Message:</strong> {message.content.content}</p>
                ) : (
                  <p><strong>Caption:</strong> {message.content.caption || "No caption"}</p>
                )}
                <p><strong>Created:</strong> {new Date(message.created_at).toLocaleDateString()}</p>
              </div>
              <p className="warning-text">
                This action cannot be undone. The {message.type} will be permanently removed from the guest book.
              </p>
              <div className="confirmation-actions">
                <ButtonWrapper onClick={onClose} className="cancel-button">
                  Cancel
                </ButtonWrapper>
                <ButtonWrapper onClick={handleConfirmDelete} className="delete-button">
                  Yes, Delete
                </ButtonWrapper>
              </div>
            </div>
          ) : (
            <div className="password-step">
              <h3>Enter password to confirm deletion</h3>
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label htmlFor="delete-password">Password:</label>
                  <input
                    type="password"
                    id="delete-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoFocus
                    disabled={submitting}
                  />
                  {passwordError && (
                    <div className="error-message">{passwordError}</div>
                  )}
                </div>

                {showCaptcha && (
                  <div className="form-group">
                    <Turnstile
                      ref={captchaRef}
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                      onSuccess={handleCaptchaSuccess}
                      onError={() => setCaptchaToken(null)}
                      onExpire={() => setCaptchaToken(null)}
                    />
                  </div>
                )}

                <div className="password-actions">
                  <ButtonWrapper
                    onClick={handleCancel}
                    className="cancel-button"
                    disabled={submitting}
                  >
                    Back
                  </ButtonWrapper>
                  <ButtonWrapper
                    onClick={() => {}} // Form submission handled by onSubmit
                    className="delete-button"
                    disabled={submitting || !captchaToken}
                  >
                    <button
                      type="submit"
                      style={{
                        background: "none",
                        border: "none",
                        color: "inherit",
                        font: "inherit",
                        cursor: "inherit",
                        padding: 0,
                        width: "100%",
                        height: "100%",
                      }}
                      disabled={submitting || !captchaToken}
                    >
                      {submitting ? "Deleting..." : "Delete Forever"}
                    </button>
                  </ButtonWrapper>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;