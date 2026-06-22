import { useState, useRef, useEffect, useCallback } from "react";

const HOLD_DURATION = 300; // ms to hold before showing menu
const REVEAL_LINGER = 3000; // ms to keep the menu visible after touch ends

/**
 * Touch press-and-hold to reveal an action menu. Timers are cleared on unmount.
 */
export function useHoldToReveal() {
  const [showMenu, setShowMenu] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const clearLinger = () => {
    if (lingerTimerRef.current) {
      clearTimeout(lingerTimerRef.current);
      lingerTimerRef.current = null;
    }
  };

  const onTouchStart = useCallback(() => {
    clearLinger();
    holdTimerRef.current = setTimeout(() => {
      setShowMenu(true);
    }, HOLD_DURATION);
  }, []);

  const onTouchEnd = useCallback(() => {
    clearHold();
    // Keep the menu visible briefly so the user can interact with it.
    lingerTimerRef.current = setTimeout(() => {
      setShowMenu(false);
    }, REVEAL_LINGER);
  }, []);

  const onTouchCancel = useCallback(() => {
    clearHold();
    clearLinger();
    setShowMenu(false);
  }, []);

  useEffect(() => {
    return () => {
      clearHold();
      clearLinger();
    };
  }, []);

  return {
    showMenu,
    touchHandlers: {
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
    },
  };
}
