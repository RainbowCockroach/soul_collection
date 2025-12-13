import React from "react";

interface PlayButtonProps {
  fill?: string;
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  fill = "#000000",
  width = "1em",
  height = "1em",
  className,
  style,
}) => {
  return (
    <svg
      fill={fill}
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      viewBox="0 0 163.861 163.861"
      xmlSpace="preserve"
      className={className}
      style={style}
    >
      <g>
        <path
          d="M34.857,3.613C20.084-4.861,8.107,2.081,8.107,19.106v125.637c0,17.042,11.977,23.975,26.75,15.509L144.67,97.275
          c14.778-8.477,14.778-22.211,0-30.686L34.857,3.613z"
        />
      </g>
    </svg>
  );
};

export default PlayButton;
