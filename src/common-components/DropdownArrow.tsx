import React from "react";

interface DropdownArrowProps {
  fill?: string;
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

const DropdownArrow: React.FC<DropdownArrowProps> = ({
  fill = "#000000",
  width = "1.5em",
  height = "1.5em",
  className,
  style,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: "inline-block",
        marginRight: "0.5rem",
        fill,
        ...style,
      }}
    >
      <path d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z" />
    </svg>
  );
};

export default DropdownArrow;
