import React from "react";
import ChatBubble from "../page-intro/ChatBubble";
import bioDataImport from "../data/bio.json";
import "./BioSection.css";

interface BioData {
  name?: string;
  picture: string;
  introduction: string;
}

export const BioSection: React.FC = () => {
  const bioData: BioData[] = bioDataImport;

  if (bioData.length === 0) {
    return null;
  }

  return (
    <div className="main-section bio-section">
      <div className="bio-container">
        {bioData.map((artist, index) => (
          <div
            key={index}
            className={`bio-artist ${
              index % 2 === 0 ? "bio-artist-left" : "bio-artist-right"
            }`}
          >
            <div className="bio-portrait">
              <img
                src={artist.picture}
                alt={artist.name || `Artist ${index + 1}`}
                className="bio-image"
              />
            </div>
            <div className="bio-introduction">
              <ChatBubble
                texts={[artist.introduction]}
                speaker={artist.name}
                speed={30}
                displayContinueIcon={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BioSection;
