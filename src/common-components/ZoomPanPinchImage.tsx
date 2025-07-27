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
import "./ZoomPanPinchImage.css";

interface ZoomPanPinchImageProps {
  src: string;
  alt: string;
}

export interface ZoomPanPinchImageRef {
  resetTransform: () => void;
}

const ZoomPanPinchImage = forwardRef<
  ZoomPanPinchImageRef,
  ZoomPanPinchImageProps
>(({ src, alt }, ref) => {
  const [interactionsDisabled, setInteractionsDisabled] = useState(true);
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

  // Auto-reset transform when src changes
  useEffect(() => {
    // Add a small delay to ensure TransformWrapper is ready
    const timer = setTimeout(() => {
      resetTransform();
    }, 50);

    return () => clearTimeout(timer);
  }, [src, resetTransform]);

  return (
    <div className="zoom-pan-pinch-container">
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
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
});

ZoomPanPinchImage.displayName = "ZoomPanPinchImage";

export default ZoomPanPinchImage;
