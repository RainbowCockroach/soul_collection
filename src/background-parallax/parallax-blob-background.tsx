import React from "react";

const ParallaxBlobBackground: React.FC = () => {
  return (
    <div>
      {/* Blob 1 */}
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          left: "-100vw",
          top: 0,
          width: "150vw",
          filter: "blur(20px)",
        }}
      >
        <path
          fill="var(--color-green-blob)"
          d="M35.2,-39.2C48,-31.2,62.5,-22.4,69.2,-8.6C75.9,5.2,74.9,23.9,63.7,30.8C52.6,37.7,31.4,32.7,14.7,37.6C-2,42.5,-14,57.1,-23.9,57.2C-33.8,57.3,-41.5,42.9,-49,28.8C-56.4,14.8,-63.6,1.2,-64.1,-14C-64.7,-29.2,-58.7,-45.9,-46.9,-54.2C-35.1,-62.5,-17.5,-62.2,-3.2,-58.4C11.2,-54.6,22.4,-47.3,35.2,-39.2Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Blob 2 */}
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          right: "-140vw",
          top: "-150vh",
          width: "200vw",
          filter: "blur(20px)",
        }}
      >
        <path
          fill="var(--color-green-blob)"
          d="M35.2,-39.2C48,-31.2,62.5,-22.4,69.2,-8.6C75.9,5.2,74.9,23.9,63.7,30.8C52.6,37.7,31.4,32.7,14.7,37.6C-2,42.5,-14,57.1,-23.9,57.2C-33.8,57.3,-41.5,42.9,-49,28.8C-56.4,14.8,-63.6,1.2,-64.1,-14C-64.7,-29.2,-58.7,-45.9,-46.9,-54.2C-35.1,-62.5,-17.5,-62.2,-3.2,-58.4C11.2,-54.6,22.4,-47.3,35.2,-39.2Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Blob 4 - Bottom Right */}
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          right: "-150vw",
          bottom: "-100vh",
          width: "200vw",
          filter: "blur(20px)",
        }}
      >
        <path
          fill="var(--color-green-blob)"
          d="M35.2,-39.2C48,-31.2,62.5,-22.4,69.2,-8.6C75.9,5.2,74.9,23.9,63.7,30.8C52.6,37.7,31.4,32.7,14.7,37.6C-2,42.5,-14,57.1,-23.9,57.2C-33.8,57.3,-41.5,42.9,-49,28.8C-56.4,14.8,-63.6,1.2,-64.1,-14C-64.7,-29.2,-58.7,-45.9,-46.9,-54.2C-35.1,-62.5,-17.5,-62.2,-3.2,-58.4C11.2,-54.6,22.4,-47.3,35.2,-39.2Z"
          transform="translate(100 100)"
        />
      </svg>
    </div>
  );
};

export default ParallaxBlobBackground;
