import { useMemo } from "react";

/**
 * Custom hook for pixelating images when content warning is present
 * Uses CSS filters to avoid CORS issues entirely
 * @param imageUrl - The original image URL
 * @param contentWarning - Content warning string, if present image will be pixelated
 * @returns Object with url and useCssFilter flag
 */
export const useBlurImage = (
  imageUrl: string,
  contentWarning?: string
): { url: string; useCssFilter: boolean } => {
  return useMemo(() => {
    // If no content warning, return original image
    if (!contentWarning || !contentWarning.trim()) {
      return { url: imageUrl, useCssFilter: false };
    }

    // For any image with content warning, use CSS filter
    // This avoids all CORS issues and works reliably
    return { url: imageUrl, useCssFilter: true };
  }, [imageUrl, contentWarning]);
};
