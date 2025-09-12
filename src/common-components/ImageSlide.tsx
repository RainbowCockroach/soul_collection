import React, { useState } from "react";
import "./ImageSlide.css";
import ZoomPanPinchImage from "./ZoomPanPinchImage";

interface ImageSlideProps {
  images: string[];
  contentWarning?: string;
}

const ImageSlide: React.FC<ImageSlideProps> = ({ images, contentWarning }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="image-slide">
      <ZoomPanPinchImage 
        src={images[currentIndex]} 
        alt={`Image ${currentIndex + 1}`} 
        contentWarning={contentWarning}
      />
      {images.length > 1 && (
        <>
          <div className="slide-buttons">
            <button
              className="slide-button div-3d-with-shadow"
              type="button"
              onClick={goToPrevious}
            >
              <span>◀</span>
            </button>
            <button
              className="slide-button div-3d-with-shadow"
              type="button"
              onClick={goToNext}
            >
              <span>▶</span>
            </button>
          </div>
          <span className="carousel-indicator">
            {currentIndex + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
};

export default ImageSlide;
