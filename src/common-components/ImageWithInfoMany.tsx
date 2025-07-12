import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ImageWithInfo from "./ImageWithInfo";
import "./ImageWithInfoMany.css";

interface ImageWithInfoManyProps {
  items: Array<{
    images: string[];
    description: string;
    title?: string;
  }>;
}

const ImageWithInfoMany: React.FC<ImageWithInfoManyProps> = ({ items }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

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
        <div className="embla-many">
          <div className="embla-many__viewport" ref={emblaRef}>
            <div className="embla-many__container">
              {items.map((item, index) => (
                <div className="embla-many__slide" key={index}>
                  <ImageWithInfo
                    images={item.images}
                    description={item.description}
                    title={item.title}
                  />
                </div>
              ))}
            </div>
          </div>
          {items.length > 1 && (
            <>
              <button
                className="embla-many__button embla-many__button--prev div-3d-with-shadow"
                type="button"
                onClick={scrollPrev}
              >
                <span>◀</span>
              </button>
              <button
                className="embla-many__button embla-many__button--next div-3d-with-shadow"
                type="button"
                onClick={scrollNext}
              >
                <span>▶</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageWithInfoMany;
