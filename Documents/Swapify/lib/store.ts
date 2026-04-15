"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MoodSettings, TrackCard, MoodPreset } from "./types";
import { MOOD_PRESETS } from "./types";

interface AppState {
  // Auth
  userId: string | null;
  spotifyUserId: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  playlistId: string | null;
  playlistTrackCount: number;

  // Mood
  moodSettings: MoodSettings;

  // Discovery queue
  queue: TrackCard[];
  currentIndex: number;
  sessionId: string | null;

  // Actions
  setUser: (user: {
    userId: string;
    spotifyUserId: string;
    displayName: string;
    avatarUrl: string | null;
    playlistId: string | null;
  }) => void;
  setPlaylistTrackCount: (count: number) => void;
  setMood: (mood: Partial<MoodSettings>) => void;
  setMoodPreset: (preset: MoodPreset) => void;
  setQueue: (tracks: TrackCard[]) => void;
  appendQueue: (tracks: TrackCard[]) => void;
  advance: () => void;
  setSessionId: (id: string) => void;
  reset: () => void;
}

const defaultMood: MoodSettings = {
  preset: "happy",
  energy: 0.65,
  valence: 0.9,
  bpmMin: 80,
  bpmMax: 150,
  danceability: 0.7,
  acousticness: 0.2,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userId: null,
      spotifyUserId: null,
      displayName: null,
      avatarUrl: null,
      playlistId: null,
      playlistTrackCount: 0,
      moodSettings: defaultMood,
      queue: [],
      currentIndex: 0,
      sessionId: null,

      setUser: (user) =>
        set({
          userId: user.userId,
          spotifyUserId: user.spotifyUserId,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          playlistId: user.playlistId,
        }),

      setPlaylistTrackCount: (count) => set({ playlistTrackCount: count }),

      setMood: (mood) =>
        set((s) => ({ moodSettings: { ...s.moodSettings, ...mood } })),

      setMoodPreset: (preset) => {
        const p = MOOD_PRESETS[preset];
        set({
          moodSettings: {
            preset,
            energy: p.energy ?? 0.5,
            valence: p.valence ?? 0.5,
            bpmMin: (p.tempo ?? 100) - 20,
            bpmMax: (p.tempo ?? 100) + 20,
            danceability: p.danceability ?? 0.5,
            acousticness: p.acousticness ?? 0.3,
          },
        });
      },

      setQueue: (tracks) => set({ queue: tracks, currentIndex: 0 }),

      appendQueue: (tracks) =>
        set((s) => ({ queue: [...s.queue, ...tracks] })),

      advance: () =>
        set((s) => ({ currentIndex: s.currentIndex + 1 })),

      setSessionId: (id) => set({ sessionId: id }),

      reset: () =>
        set({
          userId: null,
          spotifyUserId: null,
          displayName: null,
          avatarUrl: null,
          playlistId: null,
          playlistTrackCount: 0,
          queue: [],
          currentIndex: 0,
          sessionId: null,
        }),
    }),
    {
      name: "swapify-store",
      partialize: (s) => ({
        moodSettings: s.moodSettings,
        userId: s.userId,
        spotifyUserId: s.spotifyUserId,
        displayName: s.displayName,
        avatarUrl: s.avatarUrl,
        playlistId: s.playlistId,
      }),
    }
  )
);
