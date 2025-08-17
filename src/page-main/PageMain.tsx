import React, { useState, useEffect } from "react";
import SamStandee from "./SamStandee";
import ChatBubble from "./ChatBubble";
import { loadDialogByKey } from "../helpers/data-load";

const PageMain: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [samDialogTexts, setSamDialogTexts] = useState<string[]>([]);

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

  return (
    <div>
      {/* PageMain content goes here */}
      <SamStandee onClick={handleSamClick} />

      {showDialog && samDialogTexts.length > 0 && (
        <ChatBubble
          texts={samDialogTexts}
          speaker="Sam"
          onComplete={handleDialogComplete}
          onContinue={handleDialogComplete}
        />
      )}
    </div>
  );
};

export default PageMain;
