import { createContext, useContext, useState, type ReactNode } from "react";
import tagData from "../data/tag.json";

// Derive restricted tags from tag data at build time
export const KID_MODE_RESTRICTED_TAGS: string[] = Object.entries(tagData)
  .filter(
    ([, tag]) => (tag as { kidModeCensored?: boolean }).kidModeCensored === true,
  )
  .map(([slug]) => slug);

const STORAGE_KEY = "soul_collection_kid_mode";

export function isOcRestricted(tags: string[]): boolean {
  return tags.some((tag) => KID_MODE_RESTRICTED_TAGS.includes(tag));
}

interface KidModeContextType {
  isKidModeEnabled: boolean;
  toggleKidMode: () => void;
}

const KidModeContext = createContext<KidModeContextType | undefined>(undefined);

export function KidModeProvider({ children }: { children: ReactNode }) {
  const [isKidModeEnabled, setIsKidModeEnabled] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const toggleKidMode = () => {
    setIsKidModeEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <KidModeContext.Provider value={{ isKidModeEnabled, toggleKidMode }}>
      {children}
    </KidModeContext.Provider>
  );
}

export function useKidMode(): KidModeContextType {
  const context = useContext(KidModeContext);
  if (context === undefined) {
    throw new Error("useKidMode must be used within a KidModeProvider");
  }
  return context;
}
