import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OcSlot.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";
import Marquee from "react-fast-marquee";
import ButtonWrapper from "../common-components/ButtonWrapper";

export interface OC {
  slug: string;
  name: string;
  avatar: string;
}

interface OcSlotProps {
  oc: OC;
  frameColour: string;
  textColour: string;
}

// Custom hook for overflow detection
const useOverflowDetection = (text: string) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (ref.current) {
        // Create a temporary span to measure the actual text width
        const tempSpan = document.createElement("span");
        tempSpan.style.visibility = "hidden";
        tempSpan.style.position = "absolute";
        tempSpan.style.whiteSpace = "nowrap";
        tempSpan.style.font = window.getComputedStyle(ref.current).font;
        tempSpan.textContent = text;

        document.body.appendChild(tempSpan);
        const textWidth = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);

        const containerWidth = ref.current.clientWidth;
        setIsOverflowing(textWidth > containerWidth);
      }
    };

    const timeoutId = setTimeout(checkOverflow, 100);

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [text]);

  return { ref, isOverflowing };
};

const OcSlot: React.FC<OcSlotProps> = ({ oc, frameColour, textColour }) => {
  const navigate = useNavigate();
  const { ref: containerRef, isOverflowing } = useOverflowDetection(oc.name);

  const handleClick = () => {
    navigate(`${oc.slug}`);
  };

  return (
    <ButtonWrapper onClick={handleClick}>
      <div
        className="div-3d-with-shadow oc-slot"
        style={{
          backgroundColor: frameColour,
          border: `5px solid ${frameColour}`,
        }}
      >
        <img src={oc.avatar} alt={oc.name} className="oc-avatar" />
        <div className="oc-slot-name-box">
          <h3
            ref={containerRef}
            className="oc-name"
            style={{ color: textColour }}
          >
            <Marquee pauseOnHover={true} play={isOverflowing}>
              <BBCodeDisplay bbcode={oc.name} />
            </Marquee>
          </h3>
        </div>
      </div>
    </ButtonWrapper>
  );
};

export default OcSlot;
