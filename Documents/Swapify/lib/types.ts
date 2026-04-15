// ─── Spotify ─────────────────────────────────────────────────────────────────

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix timestamp (ms)
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  product: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
    release_date: string;
  };
  preview_url: string | null;
  popularity: number;
  duration_ms: number;
  external_urls: { spotify: string };
}

export interface SpotifyAudioFeatures {
  energy: number;
  valence: number;
  tempo: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
}

// ─── Mood ─────────────────────────────────────────────────────────────────────

export type MoodPreset =
  | "energetic"
  | "chill"
  | "happy"
  | "melancholic"
  | "focus"
  | "party"
  | "hype"
  | "acoustic";

export interface MoodSettings {
  preset: MoodPreset | null;
  energy: number;       // 0-1
  valence: number;      // 0-1
  bpmMin: number;
  bpmMax: number;
  danceability: number; // 0-1
  acousticness: number; // 0-1
}

export const MOOD_PRESETS: Record<MoodPreset, Partial<SpotifyAudioFeatures> & { label: string; emoji: string; color: string }> = {
  energetic: {
    label: "Energetic",
    emoji: "⚡",
    color: "#FF6B35",
    energy: 0.85,
    valence: 0.7,
    tempo: 140,
    danceability: 0.75,
    acousticness: 0.1,
  },
  chill: {
    label: "Chill",
    emoji: "🌊",
    color: "#4ECDC4",
    energy: 0.3,
    valence: 0.55,
    tempo: 90,
    danceability: 0.45,
    acousticness: 0.5,
  },
  happy: {
    label: "Happy",
    emoji: "☀️",
    color: "#FFD93D",
    energy: 0.65,
    valence: 0.9,
    tempo: 118,
    danceability: 0.7,
    acousticness: 0.2,
  },
  melancholic: {
    label: "Melancholic",
    emoji: "🌧️",
    color: "#7B8CDE",
    energy: 0.25,
    valence: 0.15,
    tempo: 75,
    danceability: 0.3,
    acousticness: 0.6,
  },
  focus: {
    label: "Focus",
    emoji: "🎯",
    color: "#6BCB77",
    energy: 0.45,
    valence: 0.5,
    tempo: 100,
    danceability: 0.4,
    acousticness: 0.35,
    instrumentalness: 0.6,
  },
  party: {
    label: "Party",
    emoji: "🎉",
    color: "#FF3CAC",
    energy: 0.9,
    valence: 0.85,
    tempo: 128,
    danceability: 0.9,
    acousticness: 0.05,
  },
  hype: {
    label: "Hype",
    emoji: "🔥",
    color: "#FF0000",
    energy: 0.95,
    valence: 0.75,
    tempo: 155,
    danceability: 0.8,
    acousticness: 0.05,
  },
  acoustic: {
    label: "Acoustic",
    emoji: "🎸",
    color: "#D4A574",
    energy: 0.35,
    valence: 0.55,
    tempo: 95,
    danceability: 0.45,
    acousticness: 0.9,
    instrumentalness: 0.1,
  },
};

// ─── Supabase DB rows ─────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  spotify_user_id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  privacy: "public" | "friends" | "private";
  created_at: string;
  last_login: string;
}

export interface DbSwipeEvent {
  id: string;
  user_id: string;
  track_id: string;
  track_name: string;
  artist_name: string;
  genre: string | null;
  direction: "left" | "right";
  mood_preset: MoodPreset | null;
  swiped_at: string;
}

export interface DbSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end: string | null;
  total_swipes: number;
  rights_count: number;
  lefts_count: number;
}

export interface DbPlaylist {
  id: string;
  user_id: string;
  spotify_playlist_id: string;
  playlist_name: string;
  created_at: string;
  total_tracks_added: number;
}

export interface DbTrackSeen {
  id: string;
  user_id: string;
  track_id: string;
  seen_at: string;
}

export interface DbFriendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
}

export interface DbMoodPreference {
  id: string;
  user_id: string;
  preset: MoodPreset | null;
  energy: number;
  valence: number;
  bpm_min: number;
  bpm_max: number;
  danceability: number;
  acousticness: number;
  updated_at: string;
}

// ─── App-level ────────────────────────────────────────────────────────────────

export interface TrackCard extends SpotifyTrack {
  genres: string[];
  dominantColors: string[];
  moodMatch: MoodPreset | null;
  isTrending: boolean;
}

export interface SwipeDirection {
  direction: "left" | "right" | null;
  deltaX: number;
  deltaY: number;
  velocity: number;
}

export interface DashboardStats {
  totalSwipes: number;
  rightSwipes: number;
  leftSwipes: number;
  acceptanceRate: number;
  favoriteGenres: { genre: string; count: number }[];
  swipesOverTime: { date: string; right: number; left: number }[];
  topSavedTracks: { track_id: string; track_name: string; artist_name: string; count: number }[];
}

export interface TrendingTrack {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_cover: string;
  right_swipes: number;
  rank: number;
  sparkline: number[];
  genres: string[];
}

export interface ActivityFeedItem {
  id: string;
  user: { id: string; display_name: string; avatar_url: string | null };
  track_name: string;
  artist_name: string;
  track_id: string;
  swiped_at: string;
}
