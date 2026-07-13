import React, { useState, useRef, useEffect } from "react";
import ButtonWrapper from "../common-components/ButtonWrapper";
import buttonSound from "/sound-effect/button_gallery_item.mp3";
import buttonSoundHover from "/sound-effect/button_hover.mp3";
import "./ActionMenu.css";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onDelete, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Close on Escape and return focus to the trigger (keyboard users)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current
          ?.querySelector<HTMLButtonElement>(".action-menu-trigger")
          ?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggleMenu = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(false);
    onEdit();
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(false);
    onDelete();
  };

  return (
    <div className={`action-menu ${className}`}>
      <div
        ref={triggerRef}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ButtonWrapper
          onClick={handleToggleMenu}
          soundFile={buttonSound}
          hoverSoundFile={buttonSoundHover}
          className="action-menu-trigger"
          tooltip="More actions"
          ariaHasPopup="menu"
          ariaExpanded={isOpen}
        >
          <div className="three-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </ButtonWrapper>
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className="action-menu-dropdown"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ButtonWrapper
            onClick={handleEdit}
            soundFile={buttonSound}
            hoverSoundFile={buttonSoundHover}
            className="action-menu-item action-menu-edit"
          >
            <span className="action-icon">✏️</span>
            <span>Edit</span>
          </ButtonWrapper>
          <ButtonWrapper
            onClick={handleDelete}
            soundFile={buttonSound}
            hoverSoundFile={buttonSoundHover}
            className="action-menu-item action-menu-delete"
          >
            <span className="action-icon">🗑️</span>
            <span>Delete</span>
          </ButtonWrapper>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;