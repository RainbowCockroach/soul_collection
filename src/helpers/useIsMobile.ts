import { useEffect, useState } from "react";

// Matches the 1024px breakpoint used throughout the guest book CSS. Returns
// true while the viewport is below desktop width so components can adjust
// behaviour (e.g. how many items to page in) to match the responsive layout.
const MOBILE_QUERY = "(max-width: 1023px)";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const handleChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}
