import React from "react";
import { toast } from "react-hot-toast";

interface CopyToClipboardButtonProps {
  text?: string;
  getData?: () => unknown;
  entityLabel?: string;
  label?: string;
  className?: string;
}

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
  text,
  getData,
  entityLabel,
  label = "Copy to clipboard",
  className = "editor-button editor-button-success",
}) => {
  const handleCopy = async () => {
    try {
      const payload =
        text !== undefined
          ? text
          : JSON.stringify(getData?.() ?? null, null, 2);
      await navigator.clipboard.writeText(payload);
      toast.success(
        entityLabel
          ? `${entityLabel} copied to clipboard!`
          : "Copied to clipboard!",
      );
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <button type="button" onClick={handleCopy} className={className}>
      {label}
    </button>
  );
};

export default CopyToClipboardButton;
