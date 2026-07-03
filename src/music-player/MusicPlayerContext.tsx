import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  MusicPlayerState,
  MusicPlayerProgress,
  MusicPlayerContextType,
} from "./types";
import { initialState, initialProgress } from "./constants";
import { MusicPlayerContext, MusicPlayerProgressContext } from "./context";

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
  const [progress, setProgress] =
    useState<MusicPlayerProgress>(initialProgress);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAutoPlayedRef = useRef<boolean>(false);
  const fadeAnimationRef = useRef<number | null>(null);

  // Latest state for the audio-event listeners and interaction handlers, so
  // they bind once instead of re-attaching on every state change.
  const stateRef = useRef(state);
  stateRef.current = state;
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= stateRef.current.tracks.length) return;

    setState((prev) => ({
      ...prev,
      currentTrackIndex: index,
      isLoading: true,
    }));
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const { isPlaying, currentTrackIndex, tracks } = stateRef.current;
    if (isPlaying) {
      // User is pausing - remember this preference
      localStorage.setItem(MUSIC_PAUSED_KEY, "true");
      audio.pause();
    } else {
      // User is playing - clear the paused flag
      localStorage.removeItem(MUSIC_PAUSED_KEY);
      if (currentTrackIndex === null && tracks.length > 0) {
        // If no track is selected, start with the first track
        playTrack(0);
        return;
      }
      audio.play().catch(console.error);
    }
  }, [playTrack]);

  const nextTrack = useCallback(() => {
    const { currentTrackIndex, tracks } = stateRef.current;
    if (currentTrackIndex === null) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(nextIndex);
  }, [playTrack]);

  const previousTrack = useCallback(() => {
    const { currentTrackIndex, tracks } = stateRef.current;
    if (currentTrackIndex === null) return;
    const prevIndex =
      currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    playTrack(prevIndex);
  }, [playTrack]);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioRef.current.volume = clampedVolume;
    setProgress((prev) => ({ ...prev, volume: clampedVolume }));
  }, []);

  const toggleLoop = useCallback(() => {
    setState((prev) => ({ ...prev, isLooping: !prev.isLooping }));
  }, []);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  }, []);

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
      setProgress((prev) => ({ ...prev, volume: startVolume }));

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use ease-out curve for more natural feel
        const easeOut = 1 - Math.pow(1 - progress, 2);
        const currentVolume =
          startVolume + (targetVolume - startVolume) * easeOut;

        audio.volume = currentVolume;
        setProgress((prev) => ({ ...prev, volume: currentVolume }));

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
      if (stateRef.current.currentTrackIndex !== null) {
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
      const { isLooping, currentTrackIndex } = stateRef.current;
      if (isLooping && currentTrackIndex !== null) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        nextTrack();
      }
    };

    const handleTimeUpdate = () => {
      setProgress((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const handleVolumeChange = () => {
      setProgress((prev) => ({ ...prev, volume: audio.volume }));
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("volumechange", handleVolumeChange);

    // Set initial volume
    audio.volume = progressRef.current.volume;

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [nextTrack]);

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
      if (audio && stateRef.current.currentTrackIndex !== null) {
        audio
          .play()
          .then(() => {
            // Mark that we've successfully auto-played
            hasAutoPlayedRef.current = true;
            if (isFirstVisit) {
              // Mark first visit as completed
              localStorage.setItem(FIRST_VISIT_KEY, "true");
              // Fade in from 0 to default volume (0.2) over 3 seconds
              fadeInAudio(initialProgress.volume, 3000);
            } else {
              // For subsequent visits, play at normal volume immediately
              audio.volume = progressRef.current.volume;
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
  }, [fadeInAudio]);

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
      if (audio && stateRef.current.currentTrackIndex !== null) {
        audio
          .play()
          .then(() => {
            // Mark that we've successfully auto-played
            hasAutoPlayedRef.current = true;
            // Mark first visit as completed
            localStorage.setItem(FIRST_VISIT_KEY, "true");
            // Fade in from 0 to default volume (0.2) over 3 seconds
            fadeInAudio(initialProgress.volume, 3000);
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
  }, [fadeInAudio]);

  // Cleanup fade animation on unmount
  useEffect(() => {
    return () => {
      if (fadeAnimationRef.current) {
        cancelAnimationFrame(fadeAnimationRef.current);
      }
    };
  }, []);

  const contextValue = useMemo<MusicPlayerContextType>(
    () => ({
      state,
      audioRef,
      playTrack,
      togglePlayPause,
      nextTrack,
      previousTrack,
      setVolume,
      toggleLoop,
      seekTo,
    }),
    [
      state,
      playTrack,
      togglePlayPause,
      nextTrack,
      previousTrack,
      setVolume,
      toggleLoop,
      seekTo,
    ]
  );

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      <MusicPlayerProgressContext.Provider value={progress}>
        {children}
        <audio ref={audioRef} preload="metadata" />
      </MusicPlayerProgressContext.Provider>
    </MusicPlayerContext.Provider>
  );
};
