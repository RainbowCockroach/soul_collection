import React from "react";

interface FastForwardArrowProps {
  fill?: string;
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

const FastForwardArrow: React.FC<FastForwardArrowProps> = ({
  fill = "#000000",
  width = "1em",
  height = "1em",
  className,
  style,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        fill,
        ...style,
      }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0476 13.5826L4.5 17.9402C3.83333 18.3251 3 17.844 3 17.0742V8.00152C3 7.23171 3.83333 6.75059 4.5 7.13549L12.0476 11.4931V8.00151C12.0476 7.23171 12.881 6.75058 13.5476 7.13548L21.4048 11.6718C22.0714 12.0567 22.0714 13.019 21.4048 13.4039L13.5476 17.9402C12.881 18.3251 12.0476 17.844 12.0476 17.0742V13.5826Z"
      />
    </svg>
  );
};

export default FastForwardArrow;
