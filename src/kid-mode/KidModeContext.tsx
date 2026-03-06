import { createContext, useContext, useState, type ReactNode } from "react";

const STORAGE_KEY = "soul_collection_kid_mode";

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
