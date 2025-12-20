import React from "react";
import "./Tooltip.css";

interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  children,
}) => {
  return (
    <div className="tooltip-wrapper">
      {children}
      <span className={`tooltip-content tooltip-${position}`}>{content}</span>
    </div>
  );
};

export default Tooltip;
