import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import "./PageHeightChart.css";
import heightChartNumber from "../assets/height_chart_number.webp";
import heightChartLines from "../assets/height_chart_lines.webp";
import type { HeightChartGroup } from "../helpers/objects";
import { loadHeightChartGroups } from "../helpers/data-load";

interface SelectedOC {
  id: string;
  x: number; // horizontal position
}

export default function PageHeightChart() {
  const [spriteGroups, setSpriteGroups] = useState<HeightChartGroup[]>([]);
  const [selectedOCs, setSelectedOCs] = useState<SelectedOC[]>([]);
  const [activeOCId, setActiveOCId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOCX, setDragStartOCX] = useState(0);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const numbersImgRef = useRef<HTMLImageElement>(null);
  const variantPopupRef = useRef<HTMLDivElement>(null);
  const [lineRepeatCount, setLineRepeatCount] = useState(10);
  const [chartScale, setChartScale] = useState(1);
  const [originalChartHeight, setOriginalChartHeight] = useState(0);

  // Flat list of all sprites for lookup
  const allSprites = useMemo(
    () =>
      spriteGroups.flatMap((group) =>
        group.variants.map((sprite) => ({ ...sprite, name: group.name })),
      ),
    [spriteGroups],
  );

  // Load height chart data
  useEffect(() => {
    loadHeightChartGroups().then(setSpriteGroups);
  }, []);

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

  const handleGroupClick = (group: HeightChartGroup) => {
    // Check if any sprite from this group is currently selected
    const selectedSprite = selectedOCs.find((oc) =>
      group.variants.some((sprite) => sprite.id === oc.id),
    );

    if (selectedSprite) {
      // Deselect the currently selected sprite from this group
      handleOCSelect(selectedSprite.id);
      setExpandedGroupId(null);
    } else if (group.variants.length === 1) {
      // Single variant - select immediately
      handleOCSelect(group.variants[0].id);
      setExpandedGroupId(null);
    } else {
      // Multiple variants - toggle variant popup
      setExpandedGroupId((prev) =>
        prev === group.groupId ? null : group.groupId,
      );
    }
  };

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

  const handleVariantSelect = (spriteId: string) => {
    handleOCSelect(spriteId);
    setExpandedGroupId(null);
  };

  const handleOCClick = (e: React.MouseEvent, ocId: string) => {
    e.stopPropagation();
    setActiveOCId(ocId);
  };

  const handleChartClick = useCallback(() => {
    setActiveOCId(null);
  }, []);

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

  // Click outside to close variant popup
  useEffect(() => {
    if (!expandedGroupId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't close if clicking inside the popup itself
      if (variantPopupRef.current?.contains(target)) {
        return;
      }

      // Don't close if clicking on a selector group button (toggle behavior)
      if (target.closest(".height-chart-selector-group")) {
        return;
      }

      // Close popup for any other clicks
      setExpandedGroupId(null);
    };

    // Use a small delay to prevent immediate closing on the same click that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandedGroupId]);

  const isGroupSelected = (group: HeightChartGroup) =>
    selectedOCs.some((oc) =>
      group.variants.some((sprite) => sprite.id === oc.id),
    );

  return (
    <div className="height-chart-page">
      {/* Main chart area */}
      <div className="height-chart-container" ref={chartRef} onClick={handleChartClick}>
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
            const sprite = allSprites.find((s) => s.id === oc.id);
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
                  "--counter-scale": 1 / chartScale,
                } as React.CSSProperties}
                onMouseDown={(e) => handleMouseDown(e, oc.id)}
                onTouchStart={(e) => handleTouchStart(e, oc.id)}
                onClick={(e) => handleOCClick(e, oc.id)}
              >
                <div className="height-chart-sprite-label">
                  <span className="height-chart-sprite-name">{sprite.name}</span>
                  <span className="height-chart-sprite-height">{sprite.height}</span>
                </div>
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

      {/* Close buttons layer (outside container to avoid overflow clipping) */}
      <div className="height-chart-close-buttons">
        {selectedOCs.map((oc) => {
          const sprite = allSprites.find((s) => s.id === oc.id);
          if (!sprite) return null;

          const isActive = activeOCId === oc.id || draggingId === oc.id;
          if (!isActive) return null;

          return (
            <button
              key={oc.id}
              className="height-chart-sprite-close"
              style={{
                left: `${oc.x}px`,
                "--counter-scale": 1 / chartScale,
              } as React.CSSProperties}
              onClick={(e) => {
                e.stopPropagation();
                handleOCSelect(oc.id);
              }}
              title="Remove sprite"
            >
              ×
            </button>
          );
        })}
      </div>

      {/* Bottom selection bar */}
      <div className="height-chart-selector">
        <div className="height-chart-selector-inner">
          {spriteGroups.map((group) => {
            const previewSprite = group.variants[0];
            const isExpanded = expandedGroupId === group.groupId;

            return (
              <div key={group.groupId} className="height-chart-selector-group">
                <button
                  className={`height-chart-selector-item ${
                    isGroupSelected(group) ? "selected" : ""
                  }`}
                  onClick={() => handleGroupClick(group)}
                  title={group.name}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}height-chart/${previewSprite.filename}`}
                    alt={group.name}
                    draggable={false}
                  />
                </button>

                {/* Variant popup */}
                {isExpanded && group.variants.length > 1 && (
                  <div
                    ref={variantPopupRef}
                    className="height-chart-variant-popup"
                  >
                    {group.variants.map((sprite) => (
                      <button
                        key={sprite.id}
                        className="height-chart-variant-item"
                        onClick={() => handleVariantSelect(sprite.id)}
                        title={group.name}
                      >
                        <img
                          src={`${import.meta.env.BASE_URL}height-chart/${sprite.filename}`}
                          alt={group.name}
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
