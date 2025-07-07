import React from "react";

interface DetailBlockGalleryProps {
  gallery: string[];
  characterName: string;
  onImageClick: (image: string) => void;
}

const DetailBlockGallery: React.FC<DetailBlockGalleryProps> = ({
  gallery,
  characterName,
  onImageClick,
}) => {
  return (
    <div className="detail-block-gallery">
      <div className="detail-gallery-grid">
        {gallery.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${characterName} gallery ${index + 1}`}
            className="detail-gallery-image"
            onClick={() => onImageClick(image)}
          />
        ))}
      </div>
    </div>
  );
};

export default DetailBlockGallery;
