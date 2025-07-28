import {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useCallback,
} from "react";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import LoadingSpinner from "./LoadingSpinner";
import "./ZoomPanPinchImage.css";
import BBCodeDisplay from "./BBCodeDisplay";

interface ZoomPanPinchImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export interface ZoomPanPinchImageRef {
  resetTransform: () => void;
}

const ZoomPanPinchImage = forwardRef<
  ZoomPanPinchImageRef,
  ZoomPanPinchImageProps
>(({ src, alt, caption }, ref) => {
  const [interactionsDisabled, setInteractionsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const resetTransform = useCallback(() => {
    if (transformRef.current) {
      // Always force reset regardless of interaction state
      transformRef.current.resetTransform();
    }
  }, []);

  const toggleInteractions = () => {
    setInteractionsDisabled(!interactionsDisabled);
  };

  useImperativeHandle(ref, () => ({
    resetTransform,
  }));

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
  };

  // Auto-reset transform when src changes
  useEffect(() => {
    setIsLoading(true);
    // Add a small delay to ensure TransformWrapper is ready
    const timer = setTimeout(() => {
      resetTransform();
    }, 50);

    return () => clearTimeout(timer);
  }, [src, resetTransform]);

  return (
    <div className="zoom-pan-pinch-container">
      {isLoading && (
        <LoadingSpinner message="👀 Wait a bit, this thing is big..." />
      )}

      <button
        className="zoom-toggle-button"
        onClick={toggleInteractions}
        title={interactionsDisabled ? "Enable zoom/pan" : "Disable zoom/pan"}
      >
        {interactionsDisabled ? "🔍" : "🔒"}
      </button>

      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        wheel={{ step: 0.1, disabled: interactionsDisabled }}
        doubleClick={{ disabled: interactionsDisabled }}
        panning={{ disabled: interactionsDisabled }}
        pinch={{ disabled: interactionsDisabled }}
        centerOnInit={true}
      >
        <TransformComponent>
          <img
            src={src}
            alt={alt}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </TransformComponent>
      </TransformWrapper>
      {caption && (
        <div className="zoom-pan-pinch-caption">
          <BBCodeDisplay bbcode={caption} />
        </div>
      )}
    </div>
  );
});

ZoomPanPinchImage.displayName = "ZoomPanPinchImage";

export default ZoomPanPinchImage;
