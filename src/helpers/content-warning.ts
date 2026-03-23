const SAFE_ONLY_PREFIX = "[safeOnly]";
// Keep backward compatibility with old prefix
const LEGACY_PREFIX = "[vanillaOnly]";

/**
 * Parse a content warning string, extracting the safe-only prefix if present.
 * @returns text (display string with prefix stripped) and safeOnly flag
 */
export function parseContentWarning(raw: string): {
  text: string;
  safeOnly: boolean;
} {
  if (raw.startsWith(SAFE_ONLY_PREFIX)) {
    return {
      text: raw.slice(SAFE_ONLY_PREFIX.length),
      safeOnly: true,
    };
  }
  if (raw.startsWith(LEGACY_PREFIX)) {
    return {
      text: raw.slice(LEGACY_PREFIX.length),
      safeOnly: true,
    };
  }
  return { text: raw, safeOnly: false };
}

/**
 * Build a content warning string with or without the safe-only prefix.
 */
export function buildContentWarning(
  text: string,
  safeOnly: boolean
): string {
  return safeOnly ? `${SAFE_ONLY_PREFIX}${text}` : text;
}
