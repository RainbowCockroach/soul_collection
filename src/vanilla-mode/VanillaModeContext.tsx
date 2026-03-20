import { createContext, useContext, useState, type ReactNode } from "react";

const STORAGE_KEY = "soul_collection_vanilla_mode";

interface VanillaModeContextType {
  isVanillaModeEnabled: boolean;
  toggleVanillaMode: () => void;
}

const VanillaModeContext = createContext<VanillaModeContextType | undefined>(undefined);

export function VanillaModeProvider({ children }: { children: ReactNode }) {
  const [isVanillaModeEnabled, setIsVanillaModeEnabled] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const toggleVanillaMode = () => {
    setIsVanillaModeEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <VanillaModeContext.Provider value={{ isVanillaModeEnabled, toggleVanillaMode }}>
      {children}
    </VanillaModeContext.Provider>
  );
}

export function useVanillaMode(): VanillaModeContextType {
  const context = useContext(VanillaModeContext);
  if (context === undefined) {
    throw new Error("useVanillaMode must be used within a VanillaModeProvider");
  }
  return context;
}
