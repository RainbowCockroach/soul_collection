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
import { useBlurImage } from "../hooks/usePixelatedImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface ZoomPanPinchImageProps {
  src: string;
  alt: string;
  caption?: string;
  contentWarning?: string;
}

export interface ZoomPanPinchImageRef {
  resetTransform: () => void;
}

const loadingMessages = [
  "👀 Wait a bit, this thing is big...",
  "👀 Some Sam art is crawling toward you...",
  "👀 Pixels are pixeling...",
  "👀 Steele got his dick stuck on ceiling fan once... Took some time to get it out.",
];

const ZoomPanPinchImage = forwardRef<
  ZoomPanPinchImageRef,
  ZoomPanPinchImageProps
>(({ src, alt, caption, contentWarning }, ref) => {
  const [interactionsDisabled, setInteractionsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageUncensored, setIsImageUncensored] = useState(false);
  const [loadingMessage] = useState(
    () => loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
  );
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Apply pixelation if content warning exists and image is not uncensored
  const { url: processedSrc, useCssFilter, displayWarning } = useBlurImage(
    src,
    isImageUncensored ? undefined : contentWarning
  );

  const resetTransform = useCallback(() => {
    if (transformRef.current) {
      // Always force reset regardless of interaction state
      transformRef.current.resetTransform();
    }
  }, []);

  const toggleInteractions = () => {
    setInteractionsDisabled((prev) => !prev);
  };

  // When zoom/pan is unlocked, move focus into the viewport so the keyboard
  // controls take effect immediately
  useEffect(() => {
    if (!interactionsDisabled) {
      viewportRef.current?.focus();
    }
  }, [interactionsDisabled]);

  // Keyboard equivalents for the pan/zoom gestures
  const handleViewportKeyDown = (e: React.KeyboardEvent) => {
    const t = transformRef.current;
    if (!t) return;

    switch (e.key) {
      case "+":
      case "=":
        e.preventDefault();
        t.zoomIn();
        break;
      case "-":
      case "_":
        e.preventDefault();
        t.zoomOut();
        break;
      case "0":
        e.preventDefault();
        t.resetTransform();
        break;
      case "Escape":
        e.preventDefault();
        setInteractionsDisabled(true);
        toggleButtonRef.current?.focus();
        break;
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight": {
        e.preventDefault();
        const step = 50;
        const { positionX, positionY, scale } = t.instance.transformState;
        const dx =
          e.key === "ArrowLeft" ? step : e.key === "ArrowRight" ? -step : 0;
        const dy =
          e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0;
        t.setTransform(positionX + dx, positionY + dy, scale);
        break;
      }
    }
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
  }, [processedSrc, resetTransform]);

  // Reset uncensor state when src or contentWarning changes
  useEffect(() => {
    setIsImageUncensored(false);
  }, [src, contentWarning]);

  // Check if image is already loaded from cache
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setIsLoading(false);
    }
  }, [processedSrc]);

  return (
    <div className="zoom-pan-pinch-container">
      {isLoading && <LoadingSpinner message={loadingMessage} />}

      <button
        ref={toggleButtonRef}
        className="zoom-toggle-button"
        onClick={toggleInteractions}
        title={interactionsDisabled ? "Enable zoom/pan" : "Disable zoom/pan"}
        aria-label={interactionsDisabled ? "Enable zoom/pan" : "Disable zoom/pan"}
        aria-pressed={!interactionsDisabled}
      >
        {interactionsDisabled ? (
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            style={{ color: "white" }}
          />
        ) : (
          <FontAwesomeIcon icon={faLock} style={{ color: "white" }} />
        )}
      </button>

      <div
        ref={viewportRef}
        className="zoom-pan-pinch-viewport"
        tabIndex={interactionsDisabled ? -1 : 0}
        role="application"
        aria-label={`Image viewer for ${alt}. Arrow keys to pan, plus and minus to zoom, 0 to reset, Escape to exit.`}
        onKeyDown={handleViewportKeyDown}
      >
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              ...(useCssFilter
                ? {
                    overflow: "hidden",
                    borderRadius: "8px",
                    background: "var(--color-purple)",
                  }
                : {}),
            }}
          >
            <img
              ref={imageRef}
              src={processedSrc}
              alt={alt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                ...(useCssFilter
                  ? {
                      filter: "blur(20px) brightness(0.8) contrast(1.1)",
                      imageRendering: "pixelated",
                      transform: "scale(1.05)",
                    }
                  : {}),
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
      {caption && (
        <div className="zoom-pan-pinch-caption">
          <BBCodeDisplay bbcode={caption} />
        </div>
      )}

      {/* Content Warning Display and Toggle - Centered */}
      {useCssFilter && !isImageUncensored && (
        <div className="content-warning-overlay-center">
          <div className="content-warning-card">
            <div className="content-warning-text">
              <strong>This contains:</strong> {displayWarning}
            </div>
            <button
              className="uncensor-toggle-button"
              onClick={() => setIsImageUncensored(true)}
            >
              Show!
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

ZoomPanPinchImage.displayName = "ZoomPanPinchImage";

export default ZoomPanPinchImage;
