import { useState, useImperativeHandle, forwardRef } from "react";
import ImageWithInfo from "./ImageWithInfo";
import "./ImageWithInfoMany.css";

interface ImageWithInfoManyProps {
  items: Array<{
    images: string[];
    description: string;
    title?: string;
  }>;
  showButtons?: boolean;
}

export interface ImageWithInfoManyRef {
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
}

const ImageWithInfoMany = forwardRef<
  ImageWithInfoManyRef,
  ImageWithInfoManyProps
>(({ items, showButtons = true }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const scrollNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const scrollTo = (index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentIndex(index);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      scrollPrev,
      scrollNext,
      scrollTo,
    }),
    [items.length]
  );

  if (!items || items.length === 0) {
    return (
      <div className="image-with-info-many">
        <div className="image-with-info-many-empty">No items to display</div>
      </div>
    );
  }

  return (
    <div className="image-with-info-many">
      <div className="image-with-info-many-carousel">
        <div className="carousel-container">
          <div className="carousel-slide">
            <ImageWithInfo
              key={currentIndex} // To make remount, fix image load error
              images={items[currentIndex].images}
              description={items[currentIndex].description}
              title={items[currentIndex].title}
            />
          </div>
        </div>
        {items.length > 1 && showButtons && (
          <div className="carousel-buttons">
            <button
              className="carousel-button div-3d-with-shadow"
              type="button"
              onClick={scrollPrev}
            >
              <span>◀</span>
            </button>
            <span className="carousel-indicator">
              {currentIndex + 1} / {items.length}
            </span>
            <button
              className="carousel-button div-3d-with-shadow"
              type="button"
              onClick={scrollNext}
            >
              <span>▶</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default ImageWithInfoMany;
