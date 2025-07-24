import { useCallback, useImperativeHandle, forwardRef } from "react";
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

export interface ImageWithInfoManyRef {
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
}

const ImageWithInfoMany = forwardRef<
  ImageWithInfoManyRef,
  ImageWithInfoManyProps
>(({ items }, ref) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    watchDrag: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
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
        </div>
      </div>
    </div>
  );
});

export default ImageWithInfoMany;
