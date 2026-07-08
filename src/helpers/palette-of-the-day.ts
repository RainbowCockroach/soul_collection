export interface DailyPalette {
  /** Human-readable name shown in the UI, e.g. "Sherbet". */
  name: string;
  /** Pen colors as hex codes. First entry is the default pen. Keep 5-6. */
  colors: string[];
}

/**
 * Curated palettes. Add as many as you like — with `%` indexing they simply
 * cycle. A list of ~30+ keeps it feeling fresh for a month before repeating.
 */
const PALETTES: DailyPalette[] = [
  { name: "Sherbet", colors: ["#F7A072", "#F9C784", "#EDDEA4", "#B5E48C", "#76C893"] },
  { name: "Dawn", colors: ["#FFCAD4", "#F4ACB7", "#9D8189", "#6D6875", "#355070"] },
  { name: "Vaporwave", colors: ["#FF71CE", "#B967FF", "#01CDFE", "#05FFA1", "#FFFB96"] },
  { name: "Forest", colors: ["#2D6A4F", "#40916C", "#74C69D", "#B7E4C7", "#1B4332"] },
  { name: "Ink & Rose", colors: ["#22223B", "#4A4E69", "#9A8C98", "#C9ADA7", "#F2E9E4"] },
  { name: "Citrus", colors: ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D"] },
  { name: "Blueberry", colors: ["#03045E", "#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"] },
  { name: "Bubblegum", colors: ["#FF5D8F", "#FF97B7", "#FFC2D1", "#845EC2", "#4B4453"] },
];

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
