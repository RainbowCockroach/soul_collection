import { createContext } from 'react';
import type { MusicPlayerContextType, MusicPlayerProgress } from './types';

export const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

// Separate context for the high-frequency progress values so ticking the
// playback time only re-renders the readouts, not the whole control bar.
export const MusicPlayerProgressContext = createContext<
  MusicPlayerProgress | undefined
>(undefined);