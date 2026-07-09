import palettesData from "../data/palette-of-the-day.json";

/** Fallback paper color when a palette doesn't specify one. */
export const DEFAULT_PAPER_COLOR = "#ffffff";

export interface DailyPalette {
  /** Human-readable name shown in the UI, e.g. "Sherbet". */
  name: string;
  /** Pen colors as hex codes. First entry is the default pen. Keep 5-6. */
  colors: string[];
  /** Default canvas/paper color for this palette. Defaults to white. */
  paperColor?: string;
}

/**
 * Curated palettes, loaded from `src/data/palette-of-the-day.json` and editable
 * via the "Palette of the Day" editor tab. With `%` indexing they simply cycle,
 * so a list of ~30+ keeps it feeling fresh for a month before repeating.
 */
const PALETTES: DailyPalette[] = palettesData as DailyPalette[];

/** Days since Unix epoch in the viewer's LOCAL time — stable for the whole day. */
function dayIndex(date: Date = new Date()): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

/**
 * The "palette API": returns today's palette. Pass a Date to preview a specific
 * day (used by tests / date-switching). Deterministic — every visitor gets the
 * same palette on the same local day.
 */
export function getPaletteOfTheDay(date: Date = new Date()): DailyPalette {
  const idx = ((dayIndex(date) % PALETTES.length) + PALETTES.length) % PALETTES.length;
  return PALETTES[idx];
}
