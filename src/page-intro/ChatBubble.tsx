import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import "./ChatBubble.css";
import type { DialogEntry } from "../helpers/objects";

interface Props {
  texts: DialogEntry[];
  speaker?: string;
  avatar?: string;
  speed?: number;
  displayContinueIcon?: boolean;
  onComplete?: () => void;
  onFinish?: () => void;
  onKidModeChoice?: () => void;
}

interface Ref {
  skip: () => void;
}

const ChatBubble = forwardRef<Ref, Props>(
  (
    {
      texts,
      speaker,
      avatar,
      speed = 50,
      displayContinueIcon = true,
      onComplete,
      onFinish,
      onKidModeChoice,
    },
    ref,
  ) => {
    const [dialogIndex, setDialogIndex] = useState(0);
    const [text, setText] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const [isAcknowledged, setIsAcknowledged] = useState(false);

    const currentEntry = texts[dialogIndex];
    const currentText =
      typeof currentEntry === "string"
        ? currentEntry
        : currentEntry?.text || "";
    const requiresAcknowledgment =
      typeof currentEntry === "object" && currentEntry.requireAcknowledgment;
    const isLastDialog = dialogIndex >= texts.length - 1;
    const hasMore = dialogIndex < texts.length - 1;

    // Reset on new texts
    useEffect(() => {
      setDialogIndex(0);
      setText("");
      setIsTyping(true);
      setIsAcknowledged(false);
    }, [texts]);

    // Reset acknowledgment when dialog changes
    useEffect(() => {
      setIsAcknowledged(false);
    }, [dialogIndex]);

    // Typing effect
    useEffect(() => {
      if (!isTyping || text.length >= currentText.length) {
        if (text.length >= currentText.length) {
          setIsTyping(false);
          if (isLastDialog) onComplete?.();
        }
        return;
      }

      const timer = setTimeout(() => {
        setText(currentText.slice(0, text.length + 1));
      }, speed);

      return () => clearTimeout(timer);
    }, [text, currentText, isTyping, speed, isLastDialog, onComplete]);

    const showFull = () => {
      setText(currentText);
      setIsTyping(false);
    };

    const advance = () => {
      if (hasMore) {
        setDialogIndex((prev) => prev + 1);
        setText("");
        setIsTyping(true);
      } else {
        onFinish?.();
      }
    };

    const next = () => {
      if (requiresAcknowledgment && !isAcknowledged) {
        return;
      }
      advance();
    };

    const skip = () => {
      if (isTyping) {
        showFull();
      } else {
        next();
      }
    };

    const handleAcceptChoice = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsAcknowledged(true);
      advance();
    };

    const handleKidModeChoiceClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsAcknowledged(true);
      onKidModeChoice?.();
      advance();
    };

    useImperativeHandle(ref, () => ({ skip }));

    return (
      <div className="chat-bubble-container" onClick={skip}>
        <div className="chat-bubble">
          {speaker && (
            <div className="chat-bubble-header">
              {avatar && (
                <div className="chat-bubble-avatar">
                  <img src={avatar} alt={speaker} />
                </div>
              )}
              <div className="chat-bubble-speaker">{speaker}</div>
            </div>
          )}

          <div className="chat-bubble-content">
            <div className="chat-bubble-text">
              {text}
              {isTyping && <span className="typing-cursor">▌</span>}
            </div>

            {!isTyping && requiresAcknowledgment && !isAcknowledged && (
              <div className="chat-bubble-choices">
                <button
                  className="chat-bubble-choice chat-bubble-choice--accept"
                  onClick={handleAcceptChoice}
                >
                  OK, understood, won't complain
                </button>
                {onKidModeChoice && (
                  <button
                    className="chat-bubble-choice chat-bubble-choice--kid-mode"
                    onClick={handleKidModeChoiceClick}
                  >
                    Shield my eyes from the wicked!
                  </button>
                )}
              </div>
            )}

            {!isTyping &&
              displayContinueIcon &&
              !(requiresAcknowledgment && !isAcknowledged) && (
                <div className="chat-bubble-continue">
                  <span className="continue-arrow">{hasMore ? "▼" : "✓"}</span>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  },
);

export default ChatBubble;
