const VANILLA_ONLY_PREFIX = "[vanillaOnly]";

/**
 * Parse a content warning string, extracting the vanilla-only prefix if present.
 * @returns text (display string with prefix stripped) and vanillaOnly flag
 */
export function parseContentWarning(raw: string): {
  text: string;
  vanillaOnly: boolean;
} {
  if (raw.startsWith(VANILLA_ONLY_PREFIX)) {
    return {
      text: raw.slice(VANILLA_ONLY_PREFIX.length),
      vanillaOnly: true,
    };
  }
  return { text: raw, vanillaOnly: false };
}

/**
 * Build a content warning string with or without the vanilla-only prefix.
 */
export function buildContentWarning(
  text: string,
  vanillaOnly: boolean
): string {
  return vanillaOnly ? `${VANILLA_ONLY_PREFIX}${text}` : text;
}
