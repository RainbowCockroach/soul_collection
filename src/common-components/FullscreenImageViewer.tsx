import { useEffect, useRef } from "react";
import ZoomPanPinchImage, { type ZoomPanPinchImageRef } from "./ZoomPanPinchImage";
import "./FullscreenImageViewer.css";

interface FullscreenImageViewerProps {
  src: string;
  alt: string;
  caption?: string;
  contentWarning?: string;
  isOpen: boolean;
  onClose: () => void;
}

const FullscreenImageViewer = ({
  src,
  alt,
  caption,
  contentWarning,
  isOpen,
  onClose,
}: FullscreenImageViewerProps) => {
  const zoomRef = useRef<ZoomPanPinchImageRef>(null);

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

  // Reset zoom when opening
  useEffect(() => {
    if (isOpen && zoomRef.current) {
      // Small delay to ensure the component is rendered
      const timer = setTimeout(() => {
        zoomRef.current?.resetTransform();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, src]);

  // Prevent body scroll when viewer is open
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
    <div className="fullscreen-image-viewer" onClick={handleBackdropClick}>
      <button className="fullscreen-close-button" onClick={onClose} title="Close (ESC)">
        ✕
      </button>

      <div className="fullscreen-image-content">
        <ZoomPanPinchImage
          ref={zoomRef}
          src={src}
          alt={alt}
          caption={caption}
          contentWarning={contentWarning}
        />
      </div>
    </div>
  );
};

export default FullscreenImageViewer;