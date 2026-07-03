import { useContext } from 'react';
import type { MusicPlayerContextType, MusicPlayerProgress } from './types';
import { MusicPlayerContext, MusicPlayerProgressContext } from './context';

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};

// Reads the high-frequency progress values (currentTime/duration/volume).
// Only components that display these should subscribe, so they alone re-render
// on each audio tick.
export const useMusicPlayerProgress = (): MusicPlayerProgress => {
  const context = useContext(MusicPlayerProgressContext);
  if (context === undefined) {
    throw new Error(
      "useMusicPlayerProgress must be used within a MusicPlayerProvider"
    );
  }
  return context;
};