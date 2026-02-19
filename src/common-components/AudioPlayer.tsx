import React, { useRef, useState, useEffect } from "react";
import "./AudioPlayer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setProgress(0); };
    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const track = trackRef.current;
    if (!audio || !track || !audio.duration) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button className="audio-player-btn" onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>
      <div ref={trackRef} className="audio-player-track" onClick={seek}>
        <div className="audio-player-fill" style={{ width: `${progress * 100}%` }} />
        <div className="audio-player-thumb" style={{ left: `${progress * 100}%` }} />
      </div>
    </div>
  );
};

export default AudioPlayer;
