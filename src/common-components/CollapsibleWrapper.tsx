import React, { type ReactNode, useId, useState } from "react";
import "./CollapsibleWrapper.css";

interface CollapsibleWrapperProps {
  button: ReactNode;
  container: ReactNode;
  defaultCollapsed?: boolean;
  buttonClassName?: string;
}

const CollapsibleWrapper: React.FC<CollapsibleWrapperProps> = ({
  button,
  container,
  defaultCollapsed = true,
  buttonClassName = "",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const containerId = useId();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="collapsible-wrapper">
      <button
        type="button"
        className={`collapsible-button ${buttonClassName}`}
        onClick={toggleCollapse}
        aria-expanded={!isCollapsed}
        aria-controls={containerId}
      >
        {button}
      </button>
      <div
        id={containerId}
        className={`collapsible-container ${isCollapsed ? "collapsed" : "expanded"}`}
      >
        {container}
      </div>
    </div>
  );
};

export default CollapsibleWrapper;
