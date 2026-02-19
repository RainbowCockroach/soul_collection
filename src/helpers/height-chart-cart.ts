const STORAGE_KEY = "height-chart-selections";

export function getHeightChartSelections(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function setHeightChartSelections(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function isInHeightChart(variantId: string): boolean {
  return getHeightChartSelections().includes(variantId);
}

/** Toggles the variant. Returns true if it was added, false if removed. */
export function toggleHeightChartSelection(variantId: string): boolean {
  const current = getHeightChartSelections();
  const idx = current.indexOf(variantId);
  if (idx >= 0) {
    current.splice(idx, 1);
    setHeightChartSelections(current);
    return false;
  } else {
    current.push(variantId);
    setHeightChartSelections(current);
    return true;
  }
}
