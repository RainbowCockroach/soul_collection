import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import "./ChatBubble.css";

interface Props {
  texts: string[];
  speaker?: string;
  avatar?: string;
  speed?: number;
  onComplete?: () => void;
  onFinish?: () => void;
}

interface Ref {
  skip: () => void;
}

const ChatBubble = forwardRef<Ref, Props>(
  ({ texts, speaker, avatar, speed = 50, onComplete, onFinish }, ref) => {
    const [dialogIndex, setDialogIndex] = useState(0);
    const [text, setText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    const currentText = texts[dialogIndex] || "";
    const isLastDialog = dialogIndex >= texts.length - 1;
    const hasMore = dialogIndex < texts.length - 1;

    // Reset on new texts
    useEffect(() => {
      setDialogIndex(0);
      setText("");
      setIsTyping(true);
    }, [texts]);

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

    const next = () => {
      if (hasMore) {
        setDialogIndex((prev) => prev + 1);
        setText("");
        setIsTyping(true);
      } else {
        onFinish?.();
      }
    };

    const skip = () => {
      if (isTyping) {
        showFull();
      } else {
        next();
      }
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

            {!isTyping && (
              <div className="chat-bubble-continue">
                <span className="continue-arrow">{hasMore ? "▼" : "✓"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default ChatBubble;
