import React from "react";
import "./GalleryBlock.css";
import type { GalleryItem } from "../helpers/objects";
import { useBlurImage } from "../hooks/usePixelatedImage";

interface GalleryBlockProps {
  gallery: GalleryItem[];
  characterName: string;
  onImageClick: (galleryItem: GalleryItem) => void;
}

interface GalleryImageProps {
  galleryItem: GalleryItem;
  characterName: string;
  index: number;
  onImageClick: (galleryItem: GalleryItem) => void;
}

const GalleryImage: React.FC<GalleryImageProps> = ({
  galleryItem,
  characterName,
  index,
  onImageClick,
}) => {
  // Use thumbnail if available, otherwise use the original image
  const originalImage = galleryItem.thumbnail || galleryItem.image;
  // Apply pixelation if content warning exists
  const { url: displayImage, useCssFilter } = useBlurImage(
    originalImage,
    galleryItem.contentWarning
  );

  return (
    <div
      key={index}
      className={`gallery-image div-3d-with-shadow ${
        useCssFilter ? "gallery-image-filtered" : ""
      }`}
      onClick={() => onImageClick(galleryItem)} // Pass the entire gallery item
      title={galleryItem.caption} // Show caption as tooltip
      style={
        useCssFilter
          ? {
              overflow: "hidden",
              position: "relative",
              background: "var(--color-purple)",
            }
          : {}
      }
    >
      <img
        src={displayImage}
        alt={
          galleryItem.caption || `${characterName} gallery ${index + 1}`
        }
        style={
          useCssFilter
            ? {
                filter: "blur(20px) brightness(0.8) contrast(1.1)",
                imageRendering: "pixelated",
                transform: "scale(1.15)",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }
            : {
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }
        }
      />
    </div>
  );
};

const GalleryBlock: React.FC<GalleryBlockProps> = ({
  gallery,
  characterName,
  onImageClick,
}) => {
  return (
    <div className="gallery">
      <div className="gallery-grid">
        {gallery.map((galleryItem, index) => (
          <GalleryImage
            key={index}
            galleryItem={galleryItem}
            characterName={characterName}
            index={index}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    </div>
  );
};

export default GalleryBlock;
