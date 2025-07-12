import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./ZoomPanPinchImage.css";

interface ZoomPanPinchImageProps {
  src: string;
  alt: string;
}

const ZoomPanPinchImage: React.FC<ZoomPanPinchImageProps> = ({ src, alt }) => {
  const [interactionsDisabled, setInteractionsDisabled] = useState(true);

  return (
    <div className="zoom-pan-pinch-container">
      <button
        className="zoom-toggle-button"
        onClick={() => setInteractionsDisabled(!interactionsDisabled)}
        title={interactionsDisabled ? "Enable zoom/pan" : "Disable zoom/pan"}
      >
        {interactionsDisabled ? "🔍" : "🔒"}
      </button>

      <TransformWrapper
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
};

export default ZoomPanPinchImage;
