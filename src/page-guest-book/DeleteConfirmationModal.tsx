import React, { useState, useEffect } from "react";
import Lightbox from "../common-components/Lightbox";
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
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setPasswordError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setPasswordError("Password is required");
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Lightbox
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
    >
      <div className="div-3d-with-shadow delete-confirmation-lightbox">
        <div className="password-step">
          <div className="delete-header">
            <h2>Enter password to delete this {message.type}</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label htmlFor="delete-password">The password is:</label>
              <input
                type="password"
                id="delete-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                disabled={submitting}
              />
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
            </div>

            <ButtonWrapper
              onClick={() => {}}
              className="submit-button delete-button"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Deleting..." : "Delete Forever"}
            </ButtonWrapper>
          </form>
        </div>
      </div>
    </Lightbox>
  );
};

export default DeleteConfirmationModal;