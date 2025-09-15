import { useEffect, useState, useRef } from "react";
import "./SamPopUp.css";
import SamStandee from "./SamStandee";
import ChatBubble from "./ChatBubble";
import { loadDialogByKey } from "../helpers/data-load";

const SamPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [samDialogTexts, setSamDialogTexts] = useState<string[]>([]);
  const [autoTriggerSam, setAutoTriggerSam] = useState(false);
  const chatBubbleRef = useRef<{ skip: () => void }>(null);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenSamPopup");

    if (!hasSeenPopup) {
      setIsVisible(true);
      // Load Sam dialog texts
      loadDialogByKey("sam-intro").then((texts) => {
        if (texts) {
          setSamDialogTexts(texts);
          // Auto-trigger Sam animation after a short delay
          setTimeout(() => {
            setAutoTriggerSam(true);
          }, 500);
        }
      });
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem("hasSeenSamPopup", "true");
    }, 300); // Match the CSS transition duration
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleSamClick = () => {
    setShowDialog(true);
  };

  const handleDialogComplete = () => {
    // Keep dialog visible after completion
  };

  const handleDialogFinish = () => {
    // Auto-close popup after a short delay when dialog finishes
    setTimeout(() => {
      handleClose();
    }, 500);
  };

  const handleTextChange = () => {
    if (showDialog && chatBubbleRef.current) {
      chatBubbleRef.current.skip();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`sam-popup-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className="sam-popup-content" onClick={handleOverlayClick}>
        <div className="sam-popup-body">
          <SamStandee
            onAnimationChange={handleSamClick}
            onTextChange={handleTextChange}
            autoTrigger={autoTriggerSam}
          />

          {showDialog && samDialogTexts.length > 0 && (
            <ChatBubble
              ref={chatBubbleRef}
              texts={samDialogTexts}
              speaker="Sam"
              onComplete={handleDialogComplete}
              onFinish={handleDialogFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SamPopup;
