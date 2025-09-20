import { createContext } from 'react';
import type { MusicPlayerContextType } from './types';

export const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);