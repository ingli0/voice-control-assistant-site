export type AchievementId =
  | "first_swipe"
  | "first_save"
  | "ten_saves"
  | "century_swiper"
  | "five_hundred"
  | "genre_hopper"
  | "mood_explorer"
  | "night_owl"
  | "early_bird"
  | "daily_streak_3"
  | "daily_streak_7"
  | "playlist_builder"
  | "social_butterfly"
  | "taste_master";

export interface Achievement {
  id: AchievementId;
  label: string;
  description: string;
  emoji: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalSwipes: number;
  totalRights: number;
  uniqueGenres: number;
  uniquePresets: number;
  nightSwipes: number;
  earlySwipes: number;
  totalSessions: number;
  savedToPlaylist: number;
  streak: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_swipe",
    label: "First Swipe",
    description: "You swiped for the first time.",
    emoji: "👋",
    tier: "bronze",
    check: (s) => s.totalSwipes >= 1,
  },
  {
    id: "first_save",
    label: "First Save",
    description: "You saved your first track to a playlist.",
    emoji: "💚",
    tier: "bronze",
    check: (s) => s.totalRights >= 1,
  },
  {
    id: "ten_saves",
    label: "Collector",
    description: "Saved 10 tracks.",
    emoji: "🎶",
    tier: "bronze",
    check: (s) => s.totalRights >= 10,
  },
  {
    id: "century_swiper",
    label: "Century Club",
    description: "100 swipes total. You're committed.",
    emoji: "💯",
    tier: "silver",
    check: (s) => s.totalSwipes >= 100,
  },
  {
    id: "five_hundred",
    label: "Audiophile",
    description: "500 swipes. You've heard it all.",
    emoji: "🎧",
    tier: "gold",
    check: (s) => s.totalSwipes >= 500,
  },
  {
    id: "genre_hopper",
    label: "Genre Hopper",
    description: "Saved tracks from 5+ different genres.",
    emoji: "🎭",
    tier: "silver",
    check: (s) => s.uniqueGenres >= 5,
  },
  {
    id: "mood_explorer",
    label: "Mood Explorer",
    description: "Used all 8 mood presets.",
    emoji: "🌈",
    tier: "gold",
    check: (s) => s.uniquePresets >= 8,
  },
  {
    id: "night_owl",
    label: "Night Owl",
    description: "Swiped at least 10 times between midnight and 4am.",
    emoji: "🦉",
    tier: "silver",
    check: (s) => s.nightSwipes >= 10,
  },
  {
    id: "early_bird",
    label: "Early Bird",
    description: "Swiped at least 5 times between 5am and 7am.",
    emoji: "🐦",
    tier: "silver",
    check: (s) => s.earlySwipes >= 5,
  },
  {
    id: "daily_streak_3",
    label: "3-Day Streak",
    description: "Used Swapify 3 days in a row.",
    emoji: "🔥",
    tier: "bronze",
    check: (s) => s.streak >= 3,
  },
  {
    id: "daily_streak_7",
    label: "Week Warrior",
    description: "7-day discovery streak. Impressive.",
    emoji: "⚡",
    tier: "gold",
    check: (s) => s.streak >= 7,
  },
  {
    id: "playlist_builder",
    label: "Playlist Builder",
    description: "Added 50 tracks to your Swapify playlist.",
    emoji: "📋",
    tier: "silver",
    check: (s) => s.savedToPlaylist >= 50,
  },
  {
    id: "social_butterfly",
    label: "Social Butterfly",
    description: "Completed 10 discovery sessions.",
    emoji: "🦋",
    tier: "silver",
    check: (s) => s.totalSessions >= 10,
  },
  {
    id: "taste_master",
    label: "Taste Master",
    description: "Saved 100 tracks. You have excellent taste.",
    emoji: "👑",
    tier: "platinum",
    check: (s) => s.totalRights >= 100,
  },
];

export const TIER_COLORS = {
  bronze:   { bg: "#cd7f32", text: "#fff", glow: "rgba(205,127,50,0.4)" },
  silver:   { bg: "#c0c0c0", text: "#1a1a1a", glow: "rgba(192,192,192,0.4)" },
  gold:     { bg: "#ffd700", text: "#1a1a1a", glow: "rgba(255,215,0,0.5)" },
  platinum: { bg: "#e5e4e2", text: "#1a1a1a", glow: "rgba(229,228,226,0.6)" },
};
