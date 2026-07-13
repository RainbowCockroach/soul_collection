import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas";
import useSound from "use-sound";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEraser,
  faRotateLeft,
  faRotateRight,
  faDownload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  getPaletteOfTheDay,
  DEFAULT_PAPER_COLOR,
} from "../../helpers/palette-of-the-day";
import buttonSound from "/sound-effect/button_gallery_item.mp3";
import "./DoodleCanvas.css";

/**
 * Imperative handle the parent (and later the fan-art form) can call.
 * Kept small and future-proof: the fan-art integration will call `exportPng()`.
 */
export interface DoodleCanvasHandle {
  /** Returns a base64 PNG data URL of the current drawing. */
  exportPng: () => Promise<string>;
  /** True when the canvas has no strokes (useful to disable submit). */
  isEmpty: () => Promise<boolean>;
  clear: () => void;
}

export interface DoodleCanvasProps {
  /** Override the day (POC/testing). Defaults to today. */
  date?: Date;
  /**
   * Canvas background color. When omitted, defaults to the day's palette paper
   * color (falling back to white) so the exported PNG isn't transparent.
   */
  canvasColor?: string;
  /** Fires whenever a stroke ends — handy for enabling/disabling a submit button. */
  onChange?: () => void;
  /**
   * POC-only "Export PNG" button + inline preview. Defaults to true for the
   * standalone demo. The fan-art form hides it and drives export via the ref.
   */
  showExportPreview?: boolean;
}

const STROKE_WIDTHS = [2, 4, 8, 16];

export const DoodleCanvas = forwardRef<DoodleCanvasHandle, DoodleCanvasProps>(
  ({ date, canvasColor, onChange, showExportPreview = true }, ref) => {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const [playClick] = useSound(buttonSound, { volume: 0.5 });
    // True while the pointer is over the canvas, so undo/redo keyboard shortcuts
    // only fire when the user is actually "in" the drawing surface (a ref, not
    // state — this doesn't need to trigger re-renders).
    const isHoveringCanvasRef = useRef(false);

    // Ctrl/Cmd+Z = undo, Ctrl/Cmd+Y (or Ctrl/Cmd+Shift+Z, the common Mac redo)
    // = redo — like standard art software. Scoped to when the mouse is over the
    // canvas so it never hijacks the page's normal shortcuts elsewhere.
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isHoveringCanvasRef.current) return;
        if (!(e.ctrlKey || e.metaKey)) return;
        const key = e.key.toLowerCase();
        if (key === "y" || (key === "z" && e.shiftKey)) {
          e.preventDefault();
          canvasRef.current?.redo();
        } else if (key === "z") {
          e.preventDefault();
          canvasRef.current?.undo();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const palette = useMemo(() => getPaletteOfTheDay(date), [date]);
    const paperColor =
      canvasColor ?? palette.paperColor ?? DEFAULT_PAPER_COLOR;

    const [strokeColor, setStrokeColor] = useState<string>(palette.colors[0]);
    const [strokeWidth, setStrokeWidth] = useState<number>(4);
    const [isErasing, setIsErasing] = useState<boolean>(false);
    // Last color picked from the custom color wheel (null until used).
    const [customColor, setCustomColor] = useState<string | null>(null);

    // POC-only: preview of the exported PNG.
    const [exportedUrl, setExportedUrl] = useState<string | null>(null);

    const selectPen = (color: string) => {
      playClick();
      setStrokeColor(color);
      setIsErasing(false);
      canvasRef.current?.eraseMode(false);
    };

    const selectCustomColor = (color: string) => {
      setCustomColor(color);
      selectPen(color);
    };

    const toggleEraser = () => {
      playClick();
      const next = !isErasing;
      setIsErasing(next);
      canvasRef.current?.eraseMode(next);
    };

    useImperativeHandle(ref, () => ({
      exportPng: async () => {
        const data = await canvasRef.current?.exportImage("png");
        return data ?? "";
      },
      isEmpty: async () => {
        const paths = await canvasRef.current?.exportPaths();
        return !paths || paths.length === 0;
      },
      clear: () => canvasRef.current?.clearCanvas(),
    }));

    const handleExportPreview = async () => {
      playClick();
      const url = await canvasRef.current?.exportImage("png");
      setExportedUrl(url ?? null);
    };

    const handleDownload = async () => {
      playClick();
      const url = await canvasRef.current?.exportImage("png");
      if (!url) return;
      const link = document.createElement("a");
      link.href = url;
      link.download = "doodle.png";
      link.click();
    };

    return (
      <div className="doodle">
        {/* Pen swatches */}
        <div className="doodle__swatches" role="radiogroup" aria-label="Pen colors">
          <span className="doodle__palette-label">
            Palette of the day: <strong>{palette.name}</strong>
          </span>

          {palette.colors.map((color) => {
            const active = !isErasing && color === strokeColor;
            return (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`Pen ${color}`}
                className={`doodle__swatch${active ? " doodle__swatch--active" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => selectPen(color)}
              />
            );
          })}

          {/* Custom color wheel — pick any color. */}
          <label
            className={`doodle__swatch doodle__swatch--custom${
              !isErasing && customColor !== null && strokeColor === customColor
                ? " doodle__swatch--active"
                : ""
            }`}
            style={customColor ? { background: customColor } : undefined}
            title="Custom color"
          >
            <span className="doodle__sr-only">Custom color</span>
            <input
              type="color"
              className="doodle__color-input"
              value={customColor ?? strokeColor}
              onChange={(e) => selectCustomColor(e.target.value)}
            />
          </label>
        </div>

        {/* Square, responsive canvas */}
        <div
          className="doodle__canvas-box"
          onMouseEnter={() => (isHoveringCanvasRef.current = true)}
          onMouseLeave={() => (isHoveringCanvasRef.current = false)}
        >
          <ReactSketchCanvas
            ref={canvasRef}
            width="100%"
            height="100%"
            canvasColor={paperColor}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            eraserWidth={strokeWidth * 2}
            className="doodle__canvas"
            onStroke={onChange}
          />
        </div>

        {/* Tools */}
        <div className="doodle__tools">
          <button
            type="button"
            className={`doodle__tool doodle__tool--icon${isErasing ? " doodle__tool--active" : ""}`}
            onClick={toggleEraser}
            aria-pressed={isErasing}
            aria-label="Eraser"
            title={isErasing ? "Eraser (on)" : "Eraser"}
          >
            <FontAwesomeIcon icon={faEraser} />
          </button>

          <div className="doodle__widths" aria-label="Stroke width">
            {STROKE_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                className={`doodle__width${w === strokeWidth ? " doodle__width--active" : ""}`}
                onClick={() => {
                  playClick();
                  setStrokeWidth(w);
                }}
              >
                <span
                  className="doodle__width-dot"
                  style={{ width: w, height: w, backgroundColor: strokeColor }}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="doodle__tool doodle__tool--icon"
            onClick={() => {
              playClick();
              canvasRef.current?.undo();
            }}
            aria-label="Undo"
            title="Undo"
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
          <button
            type="button"
            className="doodle__tool doodle__tool--icon"
            onClick={() => {
              playClick();
              canvasRef.current?.redo();
            }}
            aria-label="Redo"
            title="Redo"
          >
            <FontAwesomeIcon icon={faRotateRight} />
          </button>
          <button
            type="button"
            className="doodle__tool doodle__tool--icon"
            onClick={handleDownload}
            aria-label="Download"
            title="Download"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <button
            type="button"
            className="doodle__tool doodle__tool--icon doodle__tool--clear"
            onClick={() => {
              playClick();
              canvasRef.current?.clearCanvas();
            }}
            aria-label="Clear"
            title="Clear"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>

        {/* POC-only export preview. Hidden when embedded in the fan-art form. */}
        {showExportPreview && (
          <div className="doodle__export">
            <button type="button" className="doodle__tool doodle__tool--primary" onClick={handleExportPreview}>
              Export PNG
            </button>
            {exportedUrl && (
              <div className="doodle__preview">
                <p>Exported result:</p>
                <img src={exportedUrl} alt="Exported doodle" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

DoodleCanvas.displayName = "DoodleCanvas";
