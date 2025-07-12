import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface ZoomPanPinchImageProps {
  src: string;
  alt: string;
}

const ZoomPanPinchImage: React.FC<ZoomPanPinchImageProps> = ({ src, alt }) => {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.5}
      maxScale={4}
      wheel={{ step: 0.1 }}
      doubleClick={{ disabled: false }}
      panning={{ disabled: false }}
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
  );
};

export default ZoomPanPinchImage;
