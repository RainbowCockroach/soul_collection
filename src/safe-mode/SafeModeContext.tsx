import { createContext, useContext, useState, type ReactNode } from "react";

const STORAGE_KEY = "soul_collection_safe_mode";

interface SafeModeContextType {
  isSafeModeEnabled: boolean;
  toggleSafeMode: () => void;
}

const SafeModeContext = createContext<SafeModeContextType | undefined>(undefined);

export function SafeModeProvider({ children }: { children: ReactNode }) {
  const [isSafeModeEnabled, setIsSafeModeEnabled] = useState(() => {
    // Support migration from old key
    const oldValue = localStorage.getItem("soul_collection_vanilla_mode");
    const newValue = localStorage.getItem(STORAGE_KEY);
    if (newValue !== null) return newValue === "true";
    if (oldValue !== null) {
      localStorage.setItem(STORAGE_KEY, oldValue);
      localStorage.removeItem("soul_collection_vanilla_mode");
      return oldValue === "true";
    }
    return false;
  });

  const toggleSafeMode = () => {
    setIsSafeModeEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <SafeModeContext.Provider value={{ isSafeModeEnabled, toggleSafeMode }}>
      {children}
    </SafeModeContext.Provider>
  );
}

export function useSafeMode(): SafeModeContextType {
  const context = useContext(SafeModeContext);
  if (context === undefined) {
    throw new Error("useSafeMode must be used within a SafeModeProvider");
  }
  return context;
}
