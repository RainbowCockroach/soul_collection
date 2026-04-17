import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface DeleteButtonProps {
  onClick: () => void;
  title?: string;
  disabled?: boolean;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  title = "Delete",
  disabled,
}) => (
  <button
    type="button"
    className="editor-button editor-button-danger editor-button-small"
    onClick={onClick}
    title={title}
    aria-label={title}
    disabled={disabled}
  >
    <FontAwesomeIcon icon={faTrash} />
  </button>
);

export default DeleteButton;
