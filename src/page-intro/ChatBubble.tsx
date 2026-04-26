import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import "./ChatBubble.css";
import type { DialogEntry } from "../helpers/objects";
import { playBlip } from "../helpers/dialogBlip";

interface Props {
  texts: DialogEntry[];
  speaker?: string;
  speakerId?: string;
  avatar?: string;
  speed?: number;
  displayContinueIcon?: boolean;
  onComplete?: () => void;
  onFinish?: () => void;
  onSafeModeChoice?: () => void;
}

interface Ref {
  skip: () => void;
}

const ChatBubble = forwardRef<Ref, Props>(
  (
    {
      texts,
      speaker,
      speakerId = "sam",
      avatar,
      speed = 25,
      displayContinueIcon = true,
      onComplete,
      onFinish,
      onSafeModeChoice,
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
        const nextLen = text.length + 1;
        const ch = currentText[text.length];
        if (nextLen % 2 === 0 && ch && /\S/.test(ch) && !/[.,!?…:;]/.test(ch)) {
          playBlip(speakerId);
        }
        setText(currentText.slice(0, nextLen));
      }, speed);

      return () => clearTimeout(timer);
    }, [text, currentText, isTyping, speed, isLastDialog, onComplete, speakerId]);

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

    const handleSafeModeChoiceClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsAcknowledged(true);
      onSafeModeChoice?.();
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
                {onSafeModeChoice && (
                  <button
                    className="chat-bubble-choice chat-bubble-choice--safe-mode"
                    onClick={handleSafeModeChoiceClick}
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
