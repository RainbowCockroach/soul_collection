import { useEffect } from "react";
import ButtonWrapper from "./ButtonWrapper";
import "./Lightbox.css";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const Lightbox = ({
  isOpen,
  onClose,
  children,
  showCloseButton = true,
}: LightboxProps) => {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking on the backdrop itself, not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="lightbox-overlay" onClick={handleBackdropClick}>
      {showCloseButton && (
        <ButtonWrapper
          onClick={onClose}
          className="lightbox-close-button"
        >
          <span title="Close (ESC)">✕</span>
        </ButtonWrapper>
      )}

      <div className="lightbox-content">
        {children}
      </div>
    </div>
  );
};

export default Lightbox;