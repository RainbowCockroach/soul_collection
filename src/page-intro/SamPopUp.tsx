import { useEffect, useState, useRef, useCallback } from "react";
import "./SamPopUp.css";
import SamStandee from "./SamStandee";
import ChatBubble from "./ChatBubble";
import { loadDialogByKey } from "../helpers/data-load";
import type { DialogEntry } from "../helpers/objects";

const SamPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [samDialogTexts, setSamDialogTexts] = useState<DialogEntry[]>([]);
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

  // Prevent body scroll when popup is visible
  useEffect(() => {
    if (isVisible) {
      // Save current overflow value
      const originalOverflow = document.body.style.overflow;
      // Prevent scrolling
      document.body.style.overflow = "hidden";

      // Restore original overflow when popup is closed
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem("hasSeenSamPopup", "true");

      // Dispatch custom event to notify music player that popup is closed
      window.dispatchEvent(new CustomEvent("samPopupClosed"));
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

  const handleTextChange = useCallback(() => {
    if (showDialog && chatBubbleRef.current) {
      chatBubbleRef.current.skip();
    }
  }, [showDialog]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      if (showDialog && chatBubbleRef.current) {
        chatBubbleRef.current.skip();
      }
    }
  }, [showDialog]);

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isVisible, showDialog, handleKeyDown]);

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
