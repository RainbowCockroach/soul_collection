import React, { type ReactNode, useState } from "react";
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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="collapsible-wrapper">
      <div
        className={`collapsible-button ${buttonClassName}`}
        onClick={toggleCollapse}
      >
        {button}
      </div>
      <div
        className={`collapsible-container ${isCollapsed ? "collapsed" : "expanded"}`}
      >
        {container}
      </div>
    </div>
  );
};

export default CollapsibleWrapper;
