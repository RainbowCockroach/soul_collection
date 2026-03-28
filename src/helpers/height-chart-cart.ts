import type { HeightChartMode } from "./objects";

function storageKey(mode: HeightChartMode): string {
  return mode === "mortal"
    ? "height-chart-selections"
    : `height-chart-selections-${mode}`;
}

export function getHeightChartSelections(
  mode: HeightChartMode = "mortal",
): string[] {
  try {
    const stored = localStorage.getItem(storageKey(mode));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function setHeightChartSelections(
  ids: string[],
  mode: HeightChartMode = "mortal",
): void {
  localStorage.setItem(storageKey(mode), JSON.stringify(ids));
}

export function isInHeightChart(
  variantId: string,
  mode: HeightChartMode = "mortal",
): boolean {
  return getHeightChartSelections(mode).includes(variantId);
}

/** Toggles the variant. Returns true if it was added, false if removed. */
export function toggleHeightChartSelection(
  variantId: string,
  mode: HeightChartMode = "mortal",
): boolean {
  const current = getHeightChartSelections(mode);
  const idx = current.indexOf(variantId);
  if (idx >= 0) {
    current.splice(idx, 1);
    setHeightChartSelections(current, mode);
    return false;
  } else {
    current.push(variantId);
    setHeightChartSelections(current, mode);
    return true;
  }
}
