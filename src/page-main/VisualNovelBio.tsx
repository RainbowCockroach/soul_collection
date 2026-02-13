import { useState, useEffect } from "react";
import type { VNDialogEntry } from "../helpers/objects";
import "./VisualNovelBio.css";

interface Props {
  dialogs: VNDialogEntry[];
  backgroundUrl: string;
  speed?: number;
}

const VisualNovelBio: React.FC<Props> = ({
  dialogs,
  backgroundUrl,
  speed = 50,
}) => {
  // Build a map from characterId to their dialog entry
  const characterDialogMap = new Map<string, VNDialogEntry>();
  for (const dialog of dialogs) {
    characterDialogMap.set(dialog.speakerId, dialog);
  }

  // All characters (from the first dialog entry since they're consistent)
  const characters = dialogs[0]?.characters ?? [];

  // Active character starts as the left character (first in the array)
  const [activeCharacterId, setActiveCharacterId] = useState(
    characters[0]?.characterId ?? ""
  );
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const activeDialog = characterDialogMap.get(activeCharacterId);
  const currentText = activeDialog?.text ?? "";

  // Reset when dialogs change
  useEffect(() => {
    const firstCharId = dialogs[0]?.characters[0]?.characterId ?? "";
    setActiveCharacterId(firstCharId);
    setDisplayedText("");
    setIsTyping(true);
  }, [dialogs]);

  // Typing effect
  useEffect(() => {
    if (!isTyping || displayedText.length >= currentText.length) {
      if (displayedText.length >= currentText.length) {
        setIsTyping(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(currentText.slice(0, displayedText.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, currentText, isTyping, speed]);

  const handleCharacterClick = (characterId: string) => {
    if (characterId === activeCharacterId) return;
    setActiveCharacterId(characterId);
    setDisplayedText("");
    setIsTyping(true);
  };

  return (
    <div className="vn-bio-wrapper">
      <div className="vn-bio-frame">
        <div
          className="vn-bio-container"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        >
          {/* Character Sprites */}
          {characters.map((character) => {
            const isActive = character.characterId === activeCharacterId;
            return (
              <div
                key={character.characterId}
                className={`vn-character-sprite vn-character-${character.position}${isActive ? " vn-character-active" : ""}`}
                onClick={() => handleCharacterClick(character.characterId)}
              >
                <img src={character.spriteUrl} alt={character.characterId} />
              </div>
            );
          })}

          {/* Dialog Box */}
          {activeDialog && (
            <div className="vn-dialog-box">
              <div className="vn-dialog-border">
                <div className="vn-dialog-content">
                  {/* Name Badge */}
                  <div
                    className="vn-name-badge"
                    style={{ backgroundColor: activeDialog.nameBadgeColor }}
                  >
                    {activeDialog.speaker}
                  </div>

                  {/* Dialog Text */}
                  <div className="vn-dialog-text">
                    {displayedText}
                    {isTyping && <span className="vn-typing-cursor">▌</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualNovelBio;
