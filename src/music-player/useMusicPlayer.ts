import { useContext } from 'react';
import type { MusicPlayerContextType } from './types';
import { MusicPlayerContext } from './context';

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};