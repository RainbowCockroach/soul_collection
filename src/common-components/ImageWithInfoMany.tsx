import { useState, useImperativeHandle, forwardRef, useCallback } from "react";
import ImageWithInfo from "./ImageWithInfo";
import "./ImageWithInfoMany.css";
import ArrowButton from "./ArrowButton";

interface ImageWithInfoManyProps {
  items: Array<{
    images: string[];
    video?: string;
    description: string;
    title?: string;
    contentWarning?: string;
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

  const scrollPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  const scrollNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  }, [items.length]);

  const scrollTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length) {
        setCurrentIndex(index);
      }
    },
    [items.length]
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollPrev,
      scrollNext,
      scrollTo,
    }),
    [scrollPrev, scrollNext, scrollTo]
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
              video={items[currentIndex].video}
              description={items[currentIndex].description}
              title={items[currentIndex].title}
              contentWarning={items[currentIndex].contentWarning}
            />
          </div>
        </div>
        {items.length > 1 && showButtons && (
          <div className="carousel-buttons">
            <ArrowButton
              direction="left"
              className="carousel-button"
              onClick={scrollPrev}
            />
            <span className="carousel-indicator">
              {currentIndex + 1} / {items.length}
            </span>
            <ArrowButton
              direction="right"
              className="carousel-button"
              onClick={scrollNext}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default ImageWithInfoMany;
