import React from "react";
import "./GalleryBlock.css";

interface GalleryBlockProps {
  gallery: string[];
  characterName: string;
  onImageClick: (image: string) => void;
}

const GalleryBlock: React.FC<GalleryBlockProps> = ({
  gallery,
  characterName,
  onImageClick,
}) => {
  return (
    <div className="gallery">
      <div className="gallery-grid">
        {gallery.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${characterName} gallery ${index + 1}`}
            className="gallery-image div-3d-with-shadow"
            onClick={() => onImageClick(image)}
          />
        ))}
      </div>
    </div>
  );
};

export default GalleryBlock;
