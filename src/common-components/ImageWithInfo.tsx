import React from "react";
import "./ImageWithInfo.css";
import BBCodeDisplay from "./BBCodeDisplay";
import ImageSlide from "./ImageSlide";

interface ImageWithInfoProps {
  images: string[];
  video?: string;
  description: string;
  title?: string;
  contentWarning?: string;
}

const ImageWithInfo: React.FC<ImageWithInfoProps> = ({
  images,
  video,
  description,
  title,
  contentWarning,
}) => {

  if ((!images || images.length === 0) && !video) {
    return (
      <div className={`image-with-info`}>
        <div className="image-with-info-empty">
          <span>👀</span>
        </div>
        <div className="image-with-info-description">
          <p>{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-with-info">
      <div className="image-with-info-carousel">
        {video ? (
          <div 
            className="youtube-embed-container"
            dangerouslySetInnerHTML={{ __html: video }}
          />
        ) : (
          <ImageSlide images={images} contentWarning={contentWarning} />
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
