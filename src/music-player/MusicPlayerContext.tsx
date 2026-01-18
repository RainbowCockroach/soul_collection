import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { MusicPlayerState, MusicPlayerContextType } from "./types";
import { initialState } from "./constants";
import { MusicPlayerContext } from "./context";

const MUSIC_PAUSED_KEY = "soul_collection_music_paused";
const FIRST_VISIT_KEY = "soul_collection_first_visit_completed";
const SAM_POPUP_SEEN_KEY = "hasSeenSamPopup";

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<MusicPlayerState>(initialState);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAutoPlayedRef = useRef<boolean>(false);
  const fadeAnimationRef = useRef<number | null>(null);

  const playTrack = useCallback(
    (index: number) => {
      if (index < 0 || index >= state.tracks.length) return;

      setState((prev) => ({
        ...prev,
        currentTrackIndex: index,
        isLoading: true,
      }));
    },
    [state.tracks.length]
  );

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      // User is pausing - remember this preference
      localStorage.setItem(MUSIC_PAUSED_KEY, "true");
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

  const fadeInAudio = useCallback(
    (targetVolume: number, duration: number = 120000) => {
      const audio = audioRef.current;
      if (!audio) return;

      // Cancel any existing fade animation
      if (fadeAnimationRef.current) {
        cancelAnimationFrame(fadeAnimationRef.current);
      }

      const startVolume = 0;
      const startTime = Date.now();

      // Set initial volume to 0
      audio.volume = startVolume;
      setState((prev) => ({ ...prev, volume: startVolume }));

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use ease-out curve for more natural feel
        const easeOut = 1 - Math.pow(1 - progress, 2);
        const currentVolume =
          startVolume + (targetVolume - startVolume) * easeOut;

        audio.volume = currentVolume;
        setState((prev) => ({ ...prev, volume: currentVolume }));

        if (progress < 1) {
          fadeAnimationRef.current = requestAnimationFrame(animate);
        } else {
          fadeAnimationRef.current = null;
        }
      };

      fadeAnimationRef.current = requestAnimationFrame(animate);
    },
    []
  );

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
        // Check if user explicitly paused the music - respect this preference
        const userPausedMusic = localStorage.getItem(MUSIC_PAUSED_KEY) === "true";
        if (userPausedMusic) return;

        // Only auto-play if user has interacted (hasAutoPlayedRef = true)
        // OR if this is NOT a first-time visitor (SamPopup already seen)
        // This allows returning visitors to auto-play while blocking first-timers until popup closes
        const samPopupSeen = localStorage.getItem(SAM_POPUP_SEEN_KEY) === "true";
        if (hasAutoPlayedRef.current || samPopupSeen) {
          audio.play().catch(console.error);
        }
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

      // Check if SamPopUp hasn't been seen yet (first-time visitor with popup showing)
      const samPopupSeen = localStorage.getItem(SAM_POPUP_SEEN_KEY) === "true";

      // If SamPopup not seen yet, don't auto-play - wait for popup to close
      if (!samPopupSeen) {
        return;
      }

      // Check if user previously paused the music
      const userPausedMusic = localStorage.getItem(MUSIC_PAUSED_KEY) === "true";

      // Don't auto-play if user previously paused
      if (userPausedMusic) {
        // Mark that we've processed this interaction
        hasAutoPlayedRef.current = true;
        // Remove listeners and exit
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("touchstart", handleFirstInteraction);
        window.removeEventListener("keydown", handleFirstInteraction);
        return;
      }

      // Check if this is the user's first visit to the site
      const isFirstVisit = localStorage.getItem(FIRST_VISIT_KEY) !== "true";

      // Start playing the first track
      const audio = audioRef.current;
      if (audio && state.currentTrackIndex !== null) {
        audio
          .play()
          .then(() => {
            // Mark that we've successfully auto-played
            hasAutoPlayedRef.current = true;
            if (isFirstVisit) {
              // Mark first visit as completed
              localStorage.setItem(FIRST_VISIT_KEY, "true");
              // Fade in from 0 to default volume (0.2) over 3 seconds
              fadeInAudio(initialState.volume, 3000);
            } else {
              // For subsequent visits, play at normal volume immediately
              audio.volume = state.volume;
            }
          })
          .catch((error) => {
            console.error("Failed to auto-play music on interaction:", error);
          });
      }

      // Remove listeners after first interaction
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    // Only attach listeners if we haven't auto-played yet
    if (!hasAutoPlayedRef.current) {
      window.addEventListener("click", handleFirstInteraction);
      window.addEventListener("touchstart", handleFirstInteraction);
      window.addEventListener("keydown", handleFirstInteraction);
    }

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [state.currentTrackIndex, state.volume, fadeInAudio]);

  // Listen for SamPopUp close event to start music for first-time visitors
  useEffect(() => {
    const handleSamPopupClose = () => {
      // Only auto-play if we haven't already
      if (hasAutoPlayedRef.current) return;

      // Check if user previously paused the music
      const userPausedMusic = localStorage.getItem(MUSIC_PAUSED_KEY) === "true";
      if (userPausedMusic) return;

      // Start playing with fade-in for first-time visitors
      const audio = audioRef.current;
      if (audio && state.currentTrackIndex !== null) {
        audio
          .play()
          .then(() => {
            // Mark that we've successfully auto-played
            hasAutoPlayedRef.current = true;
            // Mark first visit as completed
            localStorage.setItem(FIRST_VISIT_KEY, "true");
            // Fade in from 0 to default volume (0.2) over 3 seconds
            fadeInAudio(initialState.volume, 3000);
          })
          .catch((error) => {
            console.error("Failed to auto-play music after popup close:", error);
          });
      }
    };

    window.addEventListener("samPopupClosed", handleSamPopupClose);

    return () => {
      window.removeEventListener("samPopupClosed", handleSamPopupClose);
    };
  }, [state.currentTrackIndex, fadeInAudio]);

  // Cleanup fade animation on unmount
  useEffect(() => {
    return () => {
      if (fadeAnimationRef.current) {
        cancelAnimationFrame(fadeAnimationRef.current);
      }
    };
  }, []);

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
