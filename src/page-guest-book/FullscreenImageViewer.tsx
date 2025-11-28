import { useEffect, useRef } from "react";
import ZoomPanPinchImage, {
  type ZoomPanPinchImageRef,
} from "../common-components/ZoomPanPinchImage";
import Lightbox from "../common-components/Lightbox";
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

  return (
    <Lightbox isOpen={isOpen} onClose={onClose}>
      <div className="fullscreen-image-content">
        <ZoomPanPinchImage
          ref={zoomRef}
          src={src}
          alt={alt}
          caption={caption}
          contentWarning={contentWarning}
        />
      </div>
    </Lightbox>
  );
};

export default FullscreenImageViewer;
