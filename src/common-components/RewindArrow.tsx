import React from "react";

interface RewindArrowProps {
  fill?: string;
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

const RewindArrow: React.FC<RewindArrowProps> = ({
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
        d="M12.8567 11.4931L20.4043 7.13548C21.071 6.75058 21.9043 7.23171 21.9043 8.00151L21.9043 17.0742C21.9043 17.844 21.071 18.3251 20.4043 17.9402L12.8567 13.5826L12.8567 17.0742C12.8567 17.844 12.0233 18.3251 11.3567 17.9402L3.49953 13.4039C2.83287 13.019 2.83287 12.0567 3.49953 11.6718L11.3567 7.13549C12.0233 6.75059 12.8567 7.23172 12.8567 8.00152L12.8567 11.4931Z"
      />
    </svg>
  );
};

export default RewindArrow;
