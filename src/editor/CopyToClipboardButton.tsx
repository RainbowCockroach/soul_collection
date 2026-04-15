import React from "react";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

interface CopyToClipboardButtonProps {
  text: string;
  label?: string;
}

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
  text,
  label = "Copy",
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="editor-button editor-button-secondary editor-button-small"
      aria-label={`Copy ${label}`}
    >
      <FontAwesomeIcon icon={faCopy} style={{ marginRight: "6px" }} />
      {label}
    </button>
  );
};

export default CopyToClipboardButton;
