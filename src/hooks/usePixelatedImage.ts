import { useMemo } from "react";
import { parseContentWarning } from "../helpers/content-warning";
import { useSafeMode } from "../safe-mode/SafeModeContext";

/**
 * Custom hook for blurring images when content warning is active.
 * Safe-mode-only warnings (prefixed with [safeOnly]) only blur in safe mode.
 * Other warnings always blur.
 * @param imageUrl - The original image URL
 * @param contentWarning - Raw content warning string (may include [safeOnly] prefix)
 * @returns Object with url, useCssFilter flag, and displayWarning (text without prefix)
 */
export const useBlurImage = (
  imageUrl: string,
  contentWarning?: string
): { url: string; useCssFilter: boolean; displayWarning?: string } => {
  const { isSafeModeEnabled } = useSafeMode();

  return useMemo(() => {
    if (!contentWarning || !contentWarning.trim()) {
      return { url: imageUrl, useCssFilter: false };
    }

    const { text, safeOnly } = parseContentWarning(contentWarning);

    // Safe-mode-only warnings only blur when safe mode is on
    if (safeOnly && !isSafeModeEnabled) {
      return { url: imageUrl, useCssFilter: false };
    }

    return { url: imageUrl, useCssFilter: true, displayWarning: text };
  }, [imageUrl, contentWarning, isSafeModeEnabled]);
};
