export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  if (from < 0 || from >= arr.length) return arr;
  const clamped = Math.max(0, Math.min(to, arr.length - 1));
  if (clamped === from) return arr;
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(clamped, 0, item);
  return result;
}

export function trackMovedIndex(
  tracked: number,
  from: number,
  to: number
): number {
  if (tracked < 0) return tracked;
  if (tracked === from) return to;
  if (from < tracked && to >= tracked) return tracked - 1;
  if (from > tracked && to <= tracked) return tracked + 1;
  return tracked;
}
