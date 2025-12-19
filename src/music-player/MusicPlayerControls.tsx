import React, { useState, useRef, useEffect } from "react";
import { useMusicPlayer } from "./useMusicPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faBackwardStep,
  faForwardStep,
  faPlay,
  faPause,
  faHourglassHalf,
  faRepeat
} from "@fortawesome/free-solid-svg-icons";
import VolumeIcon from "../common-components/VolumeIcon";
import "./MusicPlayer.css";

export const MusicPlayerControls: React.FC = () => {
  const {
    state,
    togglePlayPause,
    nextTrack,
    previousTrack,
    playTrack,
    setVolume,
    toggleLoop,
  } = useMusicPlayer();
  const [showTrackList, setShowTrackList] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeControlRef = useRef<HTMLDivElement>(null);

  const currentTrack =
    state.currentTrackIndex !== null
      ? state.tracks[state.currentTrackIndex]
      : null;

  const handleTrackSelect = (trackIndex: number) => {
    playTrack(trackIndex);
    setShowTrackList(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle click outside volume control to hide slider
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        volumeControlRef.current &&
        !volumeControlRef.current.contains(event.target as Node)
      ) {
        setShowVolumeSlider(false);
      }
    };

    if (showVolumeSlider) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVolumeSlider]);

  return (
    <div className="music-player-controls">
      {/* Track Selection Dropdown */}
      <div className="track-selector">
        <button
          className="track-selector-button"
          onClick={() => setShowTrackList(!showTrackList)}
          title="Select Track"
        >
          <span className="track-name">
            {currentTrack ? currentTrack.name : "Select Track"}
          </span>
          <FontAwesomeIcon
            icon={faCaretDown}
            className="dropdown-arrow"
            style={{
              color: "white",
              fontSize: "10px",
              transform: showTrackList ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              marginRight: 0,
            }}
          />
        </button>

        {showTrackList && (
          <div className="track-list-dropdown">
            {state.tracks.map((track, index) => (
              <button
                key={track.id}
                className={`track-list-item ${
                  index === state.currentTrackIndex ? "active" : ""
                }`}
                onClick={() => handleTrackSelect(index)}
              >
                {track.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Playback Controls */}
      <div className="playback-controls">
        <button
          className="control-button previous"
          onClick={previousTrack}
          disabled={state.tracks.length === 0}
          title="Previous Track"
        >
          <FontAwesomeIcon icon={faBackwardStep} style={{ color: "white" }} />
        </button>

        <button
          className="control-button play-pause"
          onClick={togglePlayPause}
          disabled={state.isLoading}
          title={state.isPlaying ? "Pause" : "Play"}
        >
          {state.isLoading ? (
            <FontAwesomeIcon icon={faHourglassHalf} style={{ color: "white" }} />
          ) : state.isPlaying ? (
            <FontAwesomeIcon icon={faPause} style={{ color: "white" }} />
          ) : (
            <FontAwesomeIcon icon={faPlay} style={{ color: "white" }} />
          )}
        </button>

        <button
          className="control-button next"
          onClick={nextTrack}
          disabled={state.tracks.length === 0}
          title="Next Track"
        >
          <FontAwesomeIcon icon={faForwardStep} style={{ color: "white" }} />
        </button>

        <button
          className={`control-button loop ${state.isLooping ? "active" : ""}`}
          onClick={toggleLoop}
          title={state.isLooping ? "Disable Loop" : "Enable Loop"}
        >
          <FontAwesomeIcon icon={faRepeat} style={{ color: "white" }} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="volume-control" ref={volumeControlRef}>
        <button
          className="volume-button"
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          title="Volume"
        >
          <VolumeIcon fill="white" />
        </button>

        {showVolumeSlider && (
          <div className="volume-slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
            <span className="volume-value">
              {Math.round(state.volume * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Time Display */}
      {currentTrack && state.duration > 0 && (
        <div className="time-display">
          <span className="time-current">{formatTime(state.currentTime)}</span>
          <span className="time-separator">/</span>
          <span className="time-total">{formatTime(state.duration)}</span>
        </div>
      )}
    </div>
  );
};
