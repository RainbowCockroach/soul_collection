import React, { useState } from "react";
import SamStandee from "./SamStandee";
import ChatBubble from "./ChatBubble";

const PageMain: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);

  const samDialogTexts = [
    "Oh! You clicked on me!",
    `Welcome to my Soul Collection!
    eeeeeeeeeeeeeeeeeeeeeeeeeee
    eeeeeeeeeeeeeeeeeeeeeeeeeee
    eeeeeeeeeeeeeeeeeeeeee
    eeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
    "This is where I showcase all my original characters.",
    "Feel free to explore and learn about them!",
    "Thanks for visiting! ✨",
  ];

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

      {showDialog && (
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
