import { useState, useRef, useEffect, useCallback } from "react";
import "./PageHeightChart.css";
import heightChartNumber from "../assets/height_chart_number.webp";
import heightChartLines from "../assets/height_chart_lines.webp";

// OC sprites available in public/height-chart/
const OC_SPRITES = [
  { id: "sam-regular", filename: "height_chart_sam_regular.webp", name: "Sam" },
  { id: "sam-lolita", filename: "height_chart_sam_lolita.webp", name: "Sam" },
  { id: "non-modern", filename: "height_chart_non_modern.webp", name: "Non" },
  {
    id: "non-dreamweed",
    filename: "height_chart_non_dreamweed.webp",
    name: "Non",
  },
  { id: "naame", filename: "heigh_chart_naame.webp", name: "Naame" },
];

interface SelectedOC {
  id: string;
  x: number; // horizontal position
}

export default function PageHeightChart() {
  const [selectedOCs, setSelectedOCs] = useState<SelectedOC[]>([]);
  const [activeOCId, setActiveOCId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOCX, setDragStartOCX] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const numbersImgRef = useRef<HTMLImageElement>(null);
  const [lineRepeatCount, setLineRepeatCount] = useState(10);
  const [chartScale, setChartScale] = useState(1);
  const [originalChartHeight, setOriginalChartHeight] = useState(0);

  // Get original chart height from the numbers image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalChartHeight(img.naturalHeight);
    };
    img.src = heightChartNumber;
  }, []);

  // Calculate scale factor and line repeat count
  useEffect(() => {
    const updateScale = () => {
      if (chartRef.current && originalChartHeight > 0) {
        const containerHeight = chartRef.current.clientHeight;
        const scale = containerHeight / originalChartHeight;
        setChartScale(scale);

        // Calculate line repeat count based on scaled width
        const chartWidth = chartRef.current.clientWidth;
        const estimatedLineWidth = 50 * scale; // lines scale with chart
        const count = Math.ceil(chartWidth / estimatedLineWidth) + 5;
        setLineRepeatCount(count);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [originalChartHeight]);

  const handleOCSelect = (ocId: string) => {
    setSelectedOCs((prev) => {
      const existing = prev.find((oc) => oc.id === ocId);
      if (existing) {
        // Deselect
        if (activeOCId === ocId) {
          // Set active to last remaining OC or null
          const remaining = prev.filter((oc) => oc.id !== ocId);
          setActiveOCId(
            remaining.length > 0 ? remaining[remaining.length - 1].id : null,
          );
        }
        return prev.filter((oc) => oc.id !== ocId);
      } else {
        // Select - add at center of chart
        setActiveOCId(ocId);
        const chartWidth = chartRef.current?.clientWidth || 800;
        return [...prev, { id: ocId, x: chartWidth / 2 }];
      }
    });
  };

  const handleOCClick = (ocId: string) => {
    setActiveOCId(ocId);
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, ocId: string) => {
      e.preventDefault();
      setDraggingId(ocId);
      setActiveOCId(ocId);
      setDragStartX(e.clientX);
      const oc = selectedOCs.find((o) => o.id === ocId);
      setDragStartOCX(oc?.x || 0);
    },
    [selectedOCs],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, ocId: string) => {
      const touch = e.touches[0];
      setDraggingId(ocId);
      setActiveOCId(ocId);
      setDragStartX(touch.clientX);
      const oc = selectedOCs.find((o) => o.id === ocId);
      setDragStartOCX(oc?.x || 0);
    },
    [selectedOCs],
  );

  useEffect(() => {
    if (!draggingId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      setSelectedOCs((prev) =>
        prev.map((oc) =>
          oc.id === draggingId ? { ...oc, x: dragStartOCX + deltaX } : oc,
        ),
      );
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartX;
      setSelectedOCs((prev) =>
        prev.map((oc) =>
          oc.id === draggingId ? { ...oc, x: dragStartOCX + deltaX } : oc,
        ),
      );
    };

    const handleMouseUp = () => {
      setDraggingId(null);
    };

    const handleTouchEnd = () => {
      setDraggingId(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [draggingId, dragStartX, dragStartOCX]);

  const isSelected = (ocId: string) => selectedOCs.some((oc) => oc.id === ocId);

  return (
    <div className="height-chart-page">
      {/* Main chart area */}
      <div className="height-chart-container" ref={chartRef}>
        {/* Background with number scale and lines */}
        <div className="height-chart-background">
          <img
            ref={numbersImgRef}
            src={heightChartNumber}
            alt="Height scale numbers"
            className="height-chart-numbers"
            draggable={false}
          />
          <div className="height-chart-lines-container">
            {Array.from({ length: lineRepeatCount }).map((_, index) => (
              <img
                key={index}
                src={heightChartLines}
                alt=""
                className="height-chart-lines"
                draggable={false}
              />
            ))}
          </div>
        </div>

        {/* OC sprites */}
        <div className="height-chart-sprites">
          {selectedOCs.map((oc) => {
            const sprite = OC_SPRITES.find((s) => s.id === oc.id);
            if (!sprite) return null;

            const isActive = activeOCId === oc.id || draggingId === oc.id;

            return (
              <div
                key={oc.id}
                className={`height-chart-sprite ${isActive ? "active" : ""} ${
                  draggingId === oc.id ? "dragging" : ""
                }`}
                style={{
                  left: `${oc.x}px`,
                  opacity: isActive ? 1 : 0.7,
                  transform: `translateX(-50%) scale(${chartScale})`,
                  transformOrigin: "bottom center",
                }}
                onMouseDown={(e) => handleMouseDown(e, oc.id)}
                onTouchStart={(e) => handleTouchStart(e, oc.id)}
                onClick={() => handleOCClick(oc.id)}
              >
                <img
                  src={`${import.meta.env.BASE_URL}height-chart/${sprite.filename}`}
                  alt={sprite.name}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom selection bar */}
      <div className="height-chart-selector">
        <div className="height-chart-selector-inner">
          {OC_SPRITES.map((sprite) => (
            <button
              key={sprite.id}
              className={`height-chart-selector-item ${
                isSelected(sprite.id) ? "selected" : ""
              }`}
              onClick={() => handleOCSelect(sprite.id)}
              title={sprite.name}
            >
              <img
                src={`${import.meta.env.BASE_URL}height-chart/${sprite.filename}`}
                alt={sprite.name}
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
