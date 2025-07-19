import React from "react";
import "./GalleryBlock.css";
import type { GalleryItem } from "../helpers/objects";

interface GalleryBlockProps {
  gallery: GalleryItem[];
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
        {gallery.map((galleryItem, index) => {
          // Use thumbnail if available, otherwise use the original image
          const displayImage = galleryItem.thumbnail || galleryItem.image;
          return (
            <img
              key={index}
              src={displayImage}
              alt={galleryItem.caption || `${characterName} gallery ${index + 1}`}
              className="gallery-image div-3d-with-shadow"
              onClick={() => onImageClick(galleryItem.image)} // Always pass the full image URL
              title={galleryItem.caption} // Show caption as tooltip
            />
          );
        })}
      </div>
    </div>
  );
};

export default GalleryBlock;
