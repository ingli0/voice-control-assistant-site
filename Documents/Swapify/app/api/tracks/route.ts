import { NextRequest, NextResponse } from "next/server";
import { getRecommendations, getTopArtists, refreshAccessToken, getArtistGenres } from "@/lib/spotify";
import { createServiceRoleClient } from "@/lib/supabase";
import { MOOD_PRESETS } from "@/lib/types";
import type { MoodSettings, MoodPreset, TrackCard } from "@/lib/types";

function getTokens(request: NextRequest) {
  const cookie = request.cookies.get("spotify_tokens");
  if (!cookie) return null;
  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const preset = searchParams.get("preset") as MoodPreset | null;
  const energy = parseFloat(searchParams.get("energy") ?? "0.65");
  const valence = parseFloat(searchParams.get("valence") ?? "0.7");
  const bpmMin = parseInt(searchParams.get("bpmMin") ?? "80");
  const bpmMax = parseInt(searchParams.get("bpmMax") ?? "150");
  const danceability = parseFloat(searchParams.get("danceability") ?? "0.7");
  const acousticness = parseFloat(searchParams.get("acousticness") ?? "0.2");

  const mood: MoodSettings = {
    preset,
    energy,
    valence,
    bpmMin,
    bpmMax,
    danceability,
    acousticness,
  };

  // Ensure valid token
  let accessToken = tokens.access_token;
  if (Date.now() > tokens.expires_at - 30_000) {
    const newTokens = await refreshAccessToken(tokens.refresh_token);
    accessToken = newTokens.access_token;
  }

  const supabase = createServiceRoleClient();

  // Get already-seen track IDs for this user
  const { data: seenRows } = await supabase
    .from("tracks_seen")
    .select("track_id")
    .eq("user_id", tokens.user_id)
    .order("seen_at", { ascending: false })
    .limit(500);

  const seenIds = new Set<string>((seenRows ?? []).map((r: { track_id: string }) => r.track_id));

  // Get seed artists from user's top artists
  let seedArtistIds: string[] = [];
  try {
    const topArtists = await getTopArtists(accessToken, 5);
    seedArtistIds = topArtists.map((a) => a.id);
  } catch {
    // Use fallback genres if top artists fail
    seedArtistIds = [];
  }

  // Get trending track IDs (top 50 right-swiped globally in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: trendingRows } = await supabase
    .from("swipe_events")
    .select("track_id")
    .eq("direction", "right")
    .gte("swiped_at", sevenDaysAgo);

  const trendingCounts = new Map<string, number>();
  for (const row of trendingRows ?? []) {
    trendingCounts.set(row.track_id, (trendingCounts.get(row.track_id) ?? 0) + 1);
  }
  const top50Trending = new Set<string>(
    [...trendingCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([id]) => id)
  );

  const tracks = await getRecommendations(accessToken, mood, seedArtistIds, seenIds, 20);

  // Enrich with genre data
  const artistIds = [...new Set(tracks.flatMap((t) => t.artists.map((a) => a.id)))];
  const genreMap = await getArtistGenres(accessToken, artistIds);

  const cards: TrackCard[] = tracks.map((track) => {
    const genres = track.artists.flatMap((a) => genreMap.get(a.id) ?? []);
    const uniqueGenres = [...new Set(genres)].slice(0, 3);

    // Determine mood match
    let moodMatch: MoodPreset | null = preset;
    if (!moodMatch) {
      // Try to infer mood from audio features (energy/valence approximation)
      for (const [key, mp] of Object.entries(MOOD_PRESETS)) {
        if (
          mp.energy !== undefined &&
          Math.abs((mp.energy ?? 0.5) - energy) < 0.2 &&
          mp.valence !== undefined &&
          Math.abs((mp.valence ?? 0.5) - valence) < 0.25
        ) {
          moodMatch = key as MoodPreset;
          break;
        }
      }
    }

    return {
      ...track,
      genres: uniqueGenres,
      dominantColors: ["#1DB954", "#191414"],
      moodMatch,
      isTrending: top50Trending.has(track.id),
    };
  });

  // Mark tracks as seen
  if (cards.length > 0) {
    const seenInserts = cards.map((c) => ({
      user_id: tokens.user_id,
      track_id: c.id,
    }));
    await supabase.from("tracks_seen").upsert(seenInserts, {
      onConflict: "user_id,track_id",
      ignoreDuplicates: true,
    });
  }

  // Persist mood preference
  await supabase.from("mood_preferences").upsert(
    {
      user_id: tokens.user_id,
      preset,
      energy,
      valence,
      bpm_min: bpmMin,
      bpm_max: bpmMax,
      danceability,
      acousticness,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return NextResponse.json({ tracks: cards });
}
