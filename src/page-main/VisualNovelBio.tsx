import { useState, useEffect } from "react";
import type { VNDialogEntry } from "../helpers/objects";
import "./VisualNovelBio.css";

interface Props {
  dialogs: VNDialogEntry[];
  backgroundUrl: string;
  speed?: number;
  onComplete?: () => void;
}

const VisualNovelBio: React.FC<Props> = ({
  dialogs,
  backgroundUrl,
  speed = 50,
  onComplete,
}) => {
  const [dialogIndex, setDialogIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const currentDialog = dialogs[dialogIndex];
  const currentText = currentDialog?.text || "";
  const isLastDialog = dialogIndex >= dialogs.length - 1;
  const hasMore = dialogIndex < dialogs.length - 1;

  // Reset on new dialogs
  useEffect(() => {
    setDialogIndex(0);
    setDisplayedText("");
    setIsTyping(true);
  }, [dialogs]);

  // Typing effect
  useEffect(() => {
    if (!isTyping || displayedText.length >= currentText.length) {
      if (displayedText.length >= currentText.length) {
        setIsTyping(false);
        if (isLastDialog) {
          onComplete?.();
        }
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(currentText.slice(0, displayedText.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, currentText, isTyping, speed, isLastDialog, onComplete]);

  const showFull = () => {
    setDisplayedText(currentText);
    setIsTyping(false);
  };

  const next = () => {
    if (hasMore) {
      setDialogIndex((prev) => prev + 1);
      setDisplayedText("");
      setIsTyping(true);
    }
  };

  const handleClick = () => {
    if (isTyping) {
      showFull();
    } else {
      next();
    }
  };

  return (
    <div
      className="vn-bio-container"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
      onClick={handleClick}
    >
      {/* Character Sprite */}
      <div className="vn-character-sprite">
        <img src={currentDialog.spriteUrl} alt={currentDialog.speaker} />
      </div>

      {/* Dialog Box */}
      <div className="vn-dialog-box">
        <div className="vn-dialog-border">
          <div className="vn-dialog-content">
            {/* Name Badge */}
            <div
              className="vn-name-badge"
              style={{ backgroundColor: currentDialog.nameBadgeColor }}
            >
              {currentDialog.speaker}
            </div>

            {/* Dialog Text */}
            <div className="vn-dialog-text">
              {displayedText}
              {isTyping && <span className="vn-typing-cursor">▌</span>}
            </div>

            {/* Continue Indicator */}
            {!isTyping && (
              <div className="vn-continue-indicator">
                {!isLastDialog ? "▼" : "✓"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualNovelBio;
