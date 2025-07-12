import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./ImageWithInfo.css";
import BBCodeDisplay from "./BBCodeDisplay";

interface ImageWithInfoProps {
  images: string[];
  description: string;
  title?: string;
}

const ImageWithInfo: React.FC<ImageWithInfoProps> = ({
  images,
  description,
  title,
}) => {
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

  if (!images || images.length === 0) {
    return (
      <div className={`image-with-info`}>
        <div className="image-with-info-empty">No images to display</div>
        <div className="image-with-info-description">
          <p>{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-with-info">
      <div className="image-with-info-carousel">
        <div className="embla">
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container">
              {images.map((image, index) => (
                <div className="embla__slide" key={index}>
                  <img src={image} alt={`Image ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {images.length > 1 && (
          <div className="embla__buttons">
            <button
              className="embla__button embla__button--prev div-3d-with-shadow"
              type="button"
              onClick={scrollPrev}
            >
              <span>◀</span>
            </button>
            <button
              className="embla__button embla__button--next div-3d-with-shadow"
              type="button"
              onClick={scrollNext}
            >
              <span>▶</span>
            </button>
          </div>
        )}
      </div>
      <div className="image-with-info-description">
        {title && <h3 className="image-with-info-title">{title}</h3>}
        <BBCodeDisplay bbcode={description} />
      </div>
    </div>
  );
};

export default ImageWithInfo;
