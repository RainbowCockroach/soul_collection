import React, { useState, useEffect } from 'react';
import './ChatBubble.css';

interface ChatBubbleProps {
  texts: string[];
  speaker?: string;
  avatar?: string;
  typingSpeed?: number;
  showContinueButton?: boolean;
  onComplete?: () => void;
  onContinue?: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  texts,
  speaker,
  avatar,
  typingSpeed = 50,
  showContinueButton = true,
  onComplete,
  onContinue
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const currentText = texts[currentTextIndex] || '';

  useEffect(() => {
    setDisplayedText('');
    setCurrentCharIndex(0);
    setCurrentTextIndex(0);
    setIsTyping(true);
  }, [texts]);

  useEffect(() => {
    if (currentCharIndex < currentText.length && isTyping) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + currentText[currentCharIndex]);
        setCurrentCharIndex(prev => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else if (currentCharIndex >= currentText.length && isTyping) {
      setIsTyping(false);
      if (currentTextIndex >= texts.length - 1) {
        onComplete?.();
      }
    }
  }, [currentCharIndex, currentText, typingSpeed, isTyping, currentTextIndex, texts.length, onComplete]);

  const handleSkip = () => {
    if (isTyping) {
      setDisplayedText(currentText);
      setCurrentCharIndex(currentText.length);
      setIsTyping(false);
    }
  };

  const handleContinue = () => {
    if (currentTextIndex < texts.length - 1) {
      setCurrentTextIndex(prev => prev + 1);
      setDisplayedText('');
      setCurrentCharIndex(0);
      setIsTyping(true);
    } else {
      onContinue?.();
    }
  };

  return (
    <div className="chat-bubble-container">
      <div className="chat-bubble" onClick={handleSkip}>
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
            {displayedText}
            {isTyping && <span className="typing-cursor">▌</span>}
          </div>
          
          {!isTyping && showContinueButton && (
            <div className="chat-bubble-continue" onClick={handleContinue}>
              <span className="continue-arrow">
                {currentTextIndex < texts.length - 1 ? '▼' : '✓'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
