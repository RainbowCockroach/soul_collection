import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { MusicPlayerState, MusicPlayerContextType } from './types';
import { initialState } from './constants';
import { MusicPlayerContext } from './context';

const MUSIC_PAUSED_KEY = 'soul_collection_music_paused';

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<MusicPlayerState>(initialState);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAutoPlayedRef = useRef<boolean>(false);

  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= state.tracks.length) return;

    setState((prev) => ({
      ...prev,
      currentTrackIndex: index,
      isLoading: true,
    }));
  }, [state.tracks.length]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      // User is pausing - remember this preference
      localStorage.setItem(MUSIC_PAUSED_KEY, 'true');
      audioRef.current.pause();
    } else {
      // User is playing - clear the paused flag
      localStorage.removeItem(MUSIC_PAUSED_KEY);
      if (state.currentTrackIndex === null && state.tracks.length > 0) {
        // If no track is selected, start with the first track
        playTrack(0);
        return;
      }
      audioRef.current.play().catch(console.error);
    }
  };

  const nextTrack = useCallback(() => {
    if (state.currentTrackIndex === null) return;
    const nextIndex = (state.currentTrackIndex + 1) % state.tracks.length;
    playTrack(nextIndex);
  }, [state.currentTrackIndex, state.tracks.length, playTrack]);

  const previousTrack = useCallback(() => {
    if (state.currentTrackIndex === null) return;
    const prevIndex =
      state.currentTrackIndex === 0
        ? state.tracks.length - 1
        : state.currentTrackIndex - 1;
    playTrack(prevIndex);
  }, [state.currentTrackIndex, state.tracks.length, playTrack]);

  const setVolume = (volume: number) => {
    if (!audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioRef.current.volume = clampedVolume;
    setState((prev) => ({ ...prev, volume: clampedVolume }));
  };

  const toggleLoop = () => {
    setState((prev) => ({ ...prev, isLooping: !prev.isLooping }));
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      setState((prev) => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState((prev) => ({ ...prev, isLoading: false }));
      if (state.currentTrackIndex !== null) {
        audio.play().catch(console.error);
      }
    };

    const handlePlay = () => {
      setState((prev) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    const handleEnded = () => {
      if (state.isLooping && state.currentTrackIndex !== null) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        nextTrack();
      }
    };

    const handleTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const handleVolumeChange = () => {
      setState((prev) => ({ ...prev, volume: audio.volume }));
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("volumechange", handleVolumeChange);

    // Set initial volume
    audio.volume = state.volume;

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [state.currentTrackIndex, state.isLooping, nextTrack, state.volume]);

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || state.currentTrackIndex === null) return;

    const currentTrack = state.tracks[state.currentTrackIndex];
    if (currentTrack) {
      audio.src = currentTrack.path;
    }
  }, [state.currentTrackIndex, state.tracks]);

  // Auto-play on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      // Only auto-play once, ever
      if (hasAutoPlayedRef.current) return;
      hasAutoPlayedRef.current = true;

      // Check if user previously paused the music
      const userPausedMusic = localStorage.getItem(MUSIC_PAUSED_KEY) === 'true';

      // Don't auto-play if user previously paused
      if (userPausedMusic) {
        // Remove listeners and exit
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        return;
      }

      // Start playing the first track
      const audio = audioRef.current;
      if (audio && state.currentTrackIndex !== null) {
        audio.play().catch(console.error);
      }

      // Remove listeners after first interaction
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    // Only attach listeners if we haven't auto-played yet
    if (!hasAutoPlayedRef.current) {
      window.addEventListener('click', handleFirstInteraction);
      window.addEventListener('touchstart', handleFirstInteraction);
      window.addEventListener('keydown', handleFirstInteraction);
    }

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [state.currentTrackIndex]);

  const contextValue: MusicPlayerContextType = {
    state,
    audioRef,
    playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    toggleLoop,
    seekTo,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </MusicPlayerContext.Provider>
  );
};
