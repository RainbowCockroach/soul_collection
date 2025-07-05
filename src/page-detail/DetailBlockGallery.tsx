import React from "react";

interface DetailBlockGalleryProps {
  gallery: string[];
  characterName: string;
}

const DetailBlockGallery: React.FC<DetailBlockGalleryProps> = ({
  gallery,
  characterName,
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
          />
        ))}
      </div>
    </div>
  );
};

export default DetailBlockGallery;
