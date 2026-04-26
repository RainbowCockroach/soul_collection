import { useState, useEffect } from "react";
import type { VNBioData, VNBioDialog } from "../helpers/objects";
import { loadVNBio } from "../helpers/data-load";
import "./VisualNovelBio.css";
import bioBackground from "../assets/bio_huge_lobby.webp";
import samSprite from "../assets/bio_sprite_sam.webp";
import vSprite from "../assets/bio_sprite_v.webp";

// Default bundled sprites keyed by speakerId
const DEFAULT_SPRITES: Record<string, string> = {
  sam: samSprite,
  "pink-truck-v": vSprite,
};

// Fixed character positions
const CHARACTER_POSITIONS: Record<string, "left" | "right"> = {
  sam: "left",
  "pink-truck-v": "right",
};

function getSpriteUrl(dialog: VNBioDialog): string {
  return dialog.spriteUrl || DEFAULT_SPRITES[dialog.speakerId] || "";
}

interface Props {
  speed?: number;
}

const VisualNovelBio: React.FC<Props> = ({ speed = 50 }) => {
  const [bioData, setBioData] = useState<VNBioData | null>(null);
  const [activeCharacterId, setActiveCharacterId] = useState("");
  const [dialogIndexes, setDialogIndexes] = useState<Record<string, number>>({});
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    loadVNBio().then((data) => {
      setBioData(data);
      if (data.dialogs.length > 0) {
        setActiveCharacterId(data.dialogs[0].speakerId);
        setDisplayedText("");
        setIsTyping(true);
      }
    });
  }, []);

  const dialogs = bioData?.dialogs ?? [];
  const backgroundUrl = bioData?.backgroundUrl || bioBackground;

  const dialogMap = new Map<string, VNBioDialog>();
  for (const dialog of dialogs) {
    dialogMap.set(dialog.speakerId, dialog);
  }

  const activeDialog = dialogMap.get(activeCharacterId);
  const activeIndex = dialogIndexes[activeCharacterId] ?? 0;
  const currentText = activeDialog?.text[activeIndex] ?? "";

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
    const dialog = dialogMap.get(characterId);
    if (!dialog) return;

    if (characterId === activeCharacterId) {
      // Advance to next line, looping back to start
      if (isTyping) {
        // Skip to end of current line
        setDisplayedText(currentText);
        setIsTyping(false);
      } else {
        const nextIndex = (activeIndex + 1) % dialog.text.length;
        setDialogIndexes((prev) => ({ ...prev, [characterId]: nextIndex }));
        setDisplayedText("");
        setIsTyping(true);
      }
    } else {
      setActiveCharacterId(characterId);
      setDisplayedText("");
      setIsTyping(true);
    }
  };

  if (!bioData) return null;

  return (
    <div className="vn-bio-wrapper">
      <div className="vn-bio-frame">
        <div
          className="vn-bio-container"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        >
          {/* Character Sprites */}
          {dialogs.map((dialog) => {
            const isActive = dialog.speakerId === activeCharacterId;
            const position =
              CHARACTER_POSITIONS[dialog.speakerId] ?? "left";
            return (
              <div
                key={dialog.speakerId}
                className={`vn-character-sprite vn-character-${position}${isActive ? " vn-character-active" : ""}`}
                onClick={() => handleCharacterClick(dialog.speakerId)}
              >
                <img src={getSpriteUrl(dialog)} alt={dialog.speakerId} />
              </div>
            );
          })}

          {/* Dialog Box */}
          {activeDialog && (
            <div className="vn-dialog-box" onClick={() => handleCharacterClick(activeCharacterId)}>
              <div className="vn-dialog-border">
                <div className="vn-dialog-content">
                  <div
                    className="vn-name-badge"
                    style={{ backgroundColor: activeDialog.nameBadgeColor }}
                  >
                    {activeDialog.speaker}
                  </div>
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
