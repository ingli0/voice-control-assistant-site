export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          spotify_user_id: string;
          display_name: string;
          email: string;
          avatar_url: string | null;
          privacy: "public" | "friends" | "private";
          created_at: string;
          last_login: string;
        };
        Insert: {
          id?: string;
          spotify_user_id: string;
          display_name: string;
          email: string;
          avatar_url?: string | null;
          privacy?: "public" | "friends" | "private";
          created_at?: string;
          last_login?: string;
        };
        Update: {
          id?: string;
          spotify_user_id?: string;
          display_name?: string;
          email?: string;
          avatar_url?: string | null;
          privacy?: "public" | "friends" | "private";
          last_login?: string;
          created_at?: string;
        };
      };
      swipe_events: {
        Row: {
          id: string;
          user_id: string;
          track_id: string;
          track_name: string;
          artist_name: string;
          genre: string | null;
          direction: "left" | "right";
          mood_preset: string | null;
          swiped_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          track_id: string;
          track_name: string;
          artist_name: string;
          genre?: string | null;
          direction: "left" | "right";
          mood_preset?: string | null;
          swiped_at?: string;
        };
        Update: Record<string, never>;
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          session_start: string;
          session_end: string | null;
          total_swipes: number;
          rights_count: number;
          lefts_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_start?: string;
          session_end?: string | null;
          total_swipes?: number;
          rights_count?: number;
          lefts_count?: number;
        };
        Update: {
          session_end?: string | null;
          total_swipes?: number;
          rights_count?: number;
          lefts_count?: number;
        };
      };
      playlists: {
        Row: {
          id: string;
          user_id: string;
          spotify_playlist_id: string;
          playlist_name: string;
          created_at: string;
          total_tracks_added: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          spotify_playlist_id: string;
          playlist_name: string;
          created_at?: string;
          total_tracks_added?: number;
        };
        Update: {
          total_tracks_added?: number;
        };
      };
      tracks_seen: {
        Row: {
          id: string;
          user_id: string;
          track_id: string;
          seen_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          track_id: string;
          seen_at?: string;
        };
        Update: Record<string, never>;
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: "pending" | "accepted" | "blocked";
          created_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: "pending" | "accepted" | "blocked";
          created_at?: string;
        };
        Update: {
          status?: "pending" | "accepted" | "blocked";
        };
      };
      mood_preferences: {
        Row: {
          id: string;
          user_id: string;
          preset: string | null;
          energy: number;
          valence: number;
          bpm_min: number;
          bpm_max: number;
          danceability: number;
          acousticness: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preset?: string | null;
          energy?: number;
          valence?: number;
          bpm_min?: number;
          bpm_max?: number;
          danceability?: number;
          acousticness?: number;
          updated_at?: string;
        };
        Update: {
          preset?: string | null;
          energy?: number;
          valence?: number;
          bpm_min?: number;
          bpm_max?: number;
          danceability?: number;
          acousticness?: number;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
