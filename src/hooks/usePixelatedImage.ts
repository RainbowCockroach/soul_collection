import { useMemo } from "react";
import { parseContentWarning } from "../helpers/content-warning";
import { useVanillaMode } from "../vanilla-mode/VanillaModeContext";

/**
 * Custom hook for blurring images when content warning is active.
 * Vanilla-only warnings (prefixed with [vanillaOnly]) only blur in vanilla mode.
 * Other warnings always blur.
 * @param imageUrl - The original image URL
 * @param contentWarning - Raw content warning string (may include [vanillaOnly] prefix)
 * @returns Object with url, useCssFilter flag, and displayWarning (text without prefix)
 */
export const useBlurImage = (
  imageUrl: string,
  contentWarning?: string
): { url: string; useCssFilter: boolean; displayWarning?: string } => {
  const { isVanillaModeEnabled } = useVanillaMode();

  return useMemo(() => {
    if (!contentWarning || !contentWarning.trim()) {
      return { url: imageUrl, useCssFilter: false };
    }

    const { text, vanillaOnly } = parseContentWarning(contentWarning);

    // Vanilla-only warnings only blur when vanilla mode is on
    if (vanillaOnly && !isVanillaModeEnabled) {
      return { url: imageUrl, useCssFilter: false };
    }

    return { url: imageUrl, useCssFilter: true, displayWarning: text };
  }, [imageUrl, contentWarning, isVanillaModeEnabled]);
};
