import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import * as SmartCrop from "smartcrop";
import Lightbox from "./Lightbox";
import "./ImageCropper.css";

// Handle different module export formats
const smartcrop = (SmartCrop as any).default || SmartCrop || (SmartCrop as any).smartcrop;

interface ImageCropperProps {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio: number; // e.g., 3/4, 16/9, 1 (square)
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Creates a cropped image from the provided source and crop area
 */
const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area,
  maxWidth?: number,
  maxHeight?: number
): Promise<Blob> => {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Set canvas size to the crop area
  let outputWidth = pixelCrop.width;
  let outputHeight = pixelCrop.height;

  // Scale down if max dimensions are specified
  if (maxWidth && outputWidth > maxWidth) {
    const scale = maxWidth / outputWidth;
    outputWidth = maxWidth;
    outputHeight = Math.floor(outputHeight * scale);
  }

  if (maxHeight && outputHeight > maxHeight) {
    const scale = maxHeight / outputHeight;
    outputHeight = maxHeight;
    outputWidth = Math.floor(outputWidth * scale);
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  // Convert canvas to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      "image/jpeg",
      0.95
    );
  });
};

const ImageCropper = ({
  isOpen,
  imageSrc,
  aspectRatio,
  onCropComplete,
  onCancel,
  maxWidth,
  maxHeight,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [smartcropInitialized, setSmartcropInitialized] = useState(false);

  // Reset states when modal opens with new image
  useEffect(() => {
    if (isOpen && imageSrc) {
      setSmartcropInitialized(false);
      setIsInitializing(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [isOpen, imageSrc]);

  // Use smartcrop to calculate initial crop position
  useEffect(() => {
    if (!isOpen || !imageSrc || smartcropInitialized) return;

    const initializeCrop = async () => {
      try {
        const image = new Image();
        image.crossOrigin = "anonymous"; // Enable CORS for blob URLs
        image.src = imageSrc;

        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });

        // Calculate crop dimensions based on aspect ratio
        const cropWidth = Math.min(image.width, image.height * aspectRatio);
        const cropHeight = cropWidth / aspectRatio;

        // Use smartcrop to find the best crop area
        const result = await smartcrop.crop(image, {
          width: Math.floor(cropWidth),
          height: Math.floor(cropHeight),
        });

        if (result && result.topCrop) {
          // Convert smartcrop result to react-easy-crop position
          // smartcrop returns absolute pixel coordinates (top-left corner)
          // react-easy-crop's crop prop controls MEDIA position where {x:0, y:0} centers the media
          // To position the crop area over the smartcrop result, we move the media in the opposite direction

          const smartcropCenterX = result.topCrop.x + result.topCrop.width / 2;
          const smartcropCenterY = result.topCrop.y + result.topCrop.height / 2;
          const imageCenterX = image.width / 2;
          const imageCenterY = image.height / 2;

          // Calculate offset: if smartcrop area is to the right, we need negative x (move media left)
          // Convert to percentage relative to image dimensions
          const cropX = ((imageCenterX - smartcropCenterX) / image.width) * 100;
          const cropY = ((imageCenterY - smartcropCenterY) / image.height) * 100;

          setCrop({ x: cropX, y: cropY });
          setSmartcropInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize smartcrop:", error);
        // Fall back to center position
        setCrop({ x: 0, y: 0 });
        setSmartcropInitialized(true);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeCrop();
  }, [isOpen, imageSrc, aspectRatio, smartcropInitialized]);

  const onCropChange = (location: { x: number; y: number }) => {
    setCrop(location);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);

    try {
      const croppedImage = await createCroppedImage(
        imageSrc,
        croppedAreaPixels,
        maxWidth,
        maxHeight
      );
      onCropComplete(croppedImage);
    } catch (error) {
      console.error("Failed to crop image:", error);
      alert("Failed to crop image. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Lightbox isOpen={isOpen} onClose={onCancel} showCloseButton={false}>
      <div className="image-cropper-container">
        <div className="image-cropper-wrapper">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
          />
          {isInitializing && (
            <div className="image-cropper-loading-overlay">
              Analyzing image for best crop...
            </div>
          )}
        </div>

        <div className="image-cropper-controls">
          <div className="zoom-control">
            <label htmlFor="zoom-slider">Zoom:</label>
            <input
              id="zoom-slider"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="zoom-slider"
              disabled={isInitializing}
            />
            <span className="zoom-value">{zoom.toFixed(1)}x</span>
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={onCancel}
              disabled={processing || isInitializing}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing || isInitializing}
              className="confirm-button"
            >
              {processing ? "Processing..." : "Confirm Crop"}
            </button>
          </div>
        </div>
      </div>
    </Lightbox>
  );
};

export default ImageCropper;
