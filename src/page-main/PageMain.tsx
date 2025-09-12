import React, { useState, useEffect, useRef } from "react";
import SamStandee from "./SamStandee";
import ChatBubble from "./ChatBubble";
import { loadDialogByKey } from "../helpers/data-load";
import RandomOcButton from "./RandomOcButton";

const PageMain: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [samDialogTexts, setSamDialogTexts] = useState<string[]>([]);
  const chatBubbleRef = useRef<{ skip: () => void }>(null);

  useEffect(() => {
    loadDialogByKey("sam-intro").then((texts) => {
      if (texts) {
        setSamDialogTexts(texts);
      }
    });
  }, []);

  const handleSamClick = () => {
    setShowDialog(true);
  };

  const handleDialogComplete = () => {
    // setShowDialog(false);
  };

  const handleTextChange = () => {
    console.log("Text change requested");
    if (showDialog && chatBubbleRef.current) {
      chatBubbleRef.current.skip();
    }
  };

  return (
    <div>
      <RandomOcButton />
      <SamStandee
        onAnimationChange={handleSamClick}
        onTextChange={handleTextChange}
      />

      {showDialog && samDialogTexts.length > 0 && (
        <ChatBubble
          ref={chatBubbleRef}
          texts={samDialogTexts}
          speaker="Sam"
          onComplete={handleDialogComplete}
          onFinish={handleDialogComplete}
        />
      )}
    </div>
  );
};

export default PageMain;
