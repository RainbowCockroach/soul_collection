export interface Track {
  id: string;
  name: string;
  fileName: string;
  path: string;
}

export interface MusicPlayerState {
  tracks: Track[];
  currentTrackIndex: number | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isLooping: boolean;
  duration: number;
  currentTime: number;
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

