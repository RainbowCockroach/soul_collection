export interface Track {
  id: string;
  name: string;
  fileName: string;
  path: string;
}

// Core playback state. Changes infrequently (track switch, play/pause, loop),
// so consumers that only read these fields should not re-render on every
// audio time tick.
export interface MusicPlayerState {
  tracks: Track[];
  currentTrackIndex: number | null;
  isPlaying: boolean;
  isLoading: boolean;
  isLooping: boolean;
}

// High-frequency progress state. `currentTime` updates ~4x/sec while playing
// and `volume` updates ~60x/sec during the fade-in. Kept in its own context so
// only the time/volume readouts re-render at that rate.
export interface MusicPlayerProgress {
  duration: number;
  currentTime: number;
  volume: number;
}

export interface MusicPlayerContextType {
  state: MusicPlayerState;
  audioRef: { current: HTMLAudioElement | null };
  playTrack: (index: number) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  toggleLoop: () => void;
  seekTo: (time: number) => void;
}

