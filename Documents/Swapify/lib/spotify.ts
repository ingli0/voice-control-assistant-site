import type { MoodSettings, SpotifyTrack, SpotifyUser, SpotifyTokens } from "./types";

const SPOTIFY_BASE = "https://api.spotify.com/v1";
const TOKEN_URL = "https://accounts.spotify.com/api/token";

// ─── Token helpers ────────────────────────────────────────────────────────────

export function buildAuthUrl(state: string): string {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-modify-public",
    "playlist-modify-private",
    "streaming",
    "user-top-read",
    "user-read-playback-state",
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: scopes,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    state,
    show_dialog: "false",
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<SpotifyTokens> {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error("Token refresh failed");

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

// ─── API wrapper ─────────────────────────────────────────────────────────────

async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${SPOTIFY_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify API error ${res.status}: ${body}`);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getSpotifyUser(accessToken: string): Promise<SpotifyUser> {
  return spotifyFetch<SpotifyUser>("/me", accessToken);
}

// ─── Top artists/genres (seed data for recommendations) ──────────────────────

export async function getTopArtists(
  accessToken: string,
  limit = 5
): Promise<{ id: string; name: string; genres: string[] }[]> {
  const data = await spotifyFetch<{
    items: { id: string; name: string; genres: string[] }[];
  }>(`/me/top/artists?limit=${limit}&time_range=medium_term`, accessToken);
  return data.items ?? [];
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export async function getRecommendations(
  accessToken: string,
  mood: MoodSettings,
  seedArtistIds: string[],
  seenTrackIds: Set<string>,
  limit = 20
): Promise<SpotifyTrack[]> {
  const seeds = seedArtistIds.slice(0, 5);
  if (seeds.length === 0) {
    // Fallback seed genres
    seeds.push("pop", "indie", "hip-hop");
  }

  const params = new URLSearchParams({
    limit: String(limit),
    seed_artists: seeds.join(","),
    target_energy: String(mood.energy),
    target_valence: String(mood.valence),
    min_tempo: String(mood.bpmMin),
    max_tempo: String(mood.bpmMax),
    target_danceability: String(mood.danceability),
    target_acousticness: String(mood.acousticness),
  });

  const data = await spotifyFetch<{ tracks: SpotifyTrack[] }>(
    `/recommendations?${params.toString()}`,
    accessToken
  );

  return (data.tracks ?? []).filter((t) => !seenTrackIds.has(t.id));
}

// ─── Genres for a set of artists ─────────────────────────────────────────────

export async function getArtistGenres(
  accessToken: string,
  artistIds: string[]
): Promise<Map<string, string[]>> {
  if (artistIds.length === 0) return new Map();

  const chunks: string[][] = [];
  for (let i = 0; i < artistIds.length; i += 50) {
    chunks.push(artistIds.slice(i, i + 50));
  }

  const genreMap = new Map<string, string[]>();

  for (const chunk of chunks) {
    const data = await spotifyFetch<{
      artists: { id: string; genres: string[] }[];
    }>(`/artists?ids=${chunk.join(",")}`, accessToken);

    for (const artist of data.artists ?? []) {
      genreMap.set(artist.id, artist.genres);
    }
  }

  return genreMap;
}

// ─── Playlist management ─────────────────────────────────────────────────────

export async function createPlaylist(
  accessToken: string,
  spotifyUserId: string,
  name = "🎵 Discovered via Swipe"
): Promise<{ id: string; external_urls: { spotify: string } }> {
  return spotifyFetch(
    `/users/${spotifyUserId}/playlists`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        name,
        description: "Tracks discovered using Swapify — swipe right to save!",
        public: false,
      }),
    }
  );
}

export async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  await spotifyFetch(`/playlists/${playlistId}/tracks`, accessToken, {
    method: "POST",
    body: JSON.stringify({ uris: trackUris }),
  });
}

export async function getPlaylistTrackCount(
  accessToken: string,
  playlistId: string
): Promise<number> {
  const data = await spotifyFetch<{ tracks: { total: number } }>(
    `/playlists/${playlistId}?fields=tracks(total)`,
    accessToken
  );
  return data.tracks?.total ?? 0;
}
