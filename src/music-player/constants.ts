import type { Track, MusicPlayerState } from "./types";
import { baseUrl } from "../helpers/constants";

export const initialTracks: Track[] = [
  {
    id: "kohaku",
    name: "Kohaku",
    fileName: "kohaku.mp3",
    path: `/${baseUrl}/music/kohaku.mp3`,
  },
  {
    id: "iseki",
    name: "Iseki",
    fileName: "iseki.mp3",
    path: `/${baseUrl}/music/iseki.mp3`,
  },
  {
    id: "oxygen",
    name: "Oxygen",
    fileName: "oxygen.mp3",
    path: `/${baseUrl}/music/oxygen.mp3`,
  },
  {
    id: "soda",
    name: "Soda",
    fileName: "soda.mp3",
    path: `/${baseUrl}/music/soda.mp3`,
  },
  {
    id: "speedy",
    name: "Speedy",
    fileName: "speedy.mp3",
    path: `/${baseUrl}/music/speedy.mp3`,
  },
  {
    id: "white-labyrinth",
    name: "White Labyrinth",
    fileName: "white-labyrinth-active.mp3",
    path: `/${baseUrl}/music/white-labyrinth-active.mp3`,
  },
];

export const initialState: MusicPlayerState = {
  tracks: initialTracks,
  currentTrackIndex: null,
  isPlaying: false,
  isLoading: false,
  volume: 0.2,
  isLooping: true,
  duration: 0,
  currentTime: 0,
};
