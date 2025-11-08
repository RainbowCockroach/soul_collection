import React, { useState, useRef, useEffect } from "react";
import ButtonWrapper from "../common-components/ButtonWrapper";
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleEdit = () => {
    setIsOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setIsOpen(false);
    onDelete();
  };

  return (
    <div className={`action-menu ${className}`}>
      <div ref={triggerRef}>
        <ButtonWrapper
          onClick={handleToggleMenu}
          className="action-menu-trigger"
        >
          <div className="three-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </ButtonWrapper>
      </div>

      {isOpen && (
        <div ref={menuRef} className="action-menu-dropdown">
          <ButtonWrapper
            onClick={handleEdit}
            className="action-menu-item action-menu-edit"
          >
            <span className="action-icon">✏️</span>
            <span>Edit</span>
          </ButtonWrapper>
          <ButtonWrapper
            onClick={handleDelete}
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