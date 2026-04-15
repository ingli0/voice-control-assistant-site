import { NextRequest, NextResponse } from "next/server";
import {
  addTracksToPlaylist,
  refreshAccessToken,
  createPlaylist,
} from "@/lib/spotify";
import { createServiceRoleClient } from "@/lib/supabase";

function getTokens(request: NextRequest) {
  const cookie = request.cookies.get("spotify_tokens");
  if (!cookie) return null;
  try { return JSON.parse(cookie.value); } catch { return null; }
}

export async function POST(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { track_id, track_name, artist_name, genre, direction, mood_preset, session_id } = body;

  if (!track_id || !direction) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // direction can be "left" | "right" | "super"
  // "super" counts as a right-swipe for analytics
  const analyticsDirection = direction === "super" ? "right" : direction;

  // Record swipe event
  await supabase.from("swipe_events").insert({
    user_id: tokens.user_id,
    track_id,
    track_name,
    artist_name,
    genre: genre ?? null,
    direction: analyticsDirection,
    mood_preset: mood_preset ?? null,
  });

  // Update session counters
  if (session_id) {
    const { data: session } = await supabase
      .from("sessions")
      .select("total_swipes, rights_count, lefts_count")
      .eq("id", session_id)
      .maybeSingle();

    if (session) {
      await supabase.from("sessions").update({
        total_swipes: session.total_swipes + 1,
        rights_count: session.rights_count + (analyticsDirection === "right" ? 1 : 0),
        lefts_count:  session.lefts_count  + (analyticsDirection === "left"  ? 1 : 0),
      }).eq("id", session_id);
    }
  }

  let playlistTrackCount: number | null = null;
  let newlyUnlocked: string[] = [];

  // Add to playlist on right or super
  if ((direction === "right" || direction === "super") && tokens.playlist_id) {
    try {
      let accessToken = tokens.access_token;
      if (Date.now() > tokens.expires_at - 30_000) {
        const refreshed = await refreshAccessToken(tokens.refresh_token);
        accessToken = refreshed.access_token;
      }

      // For super like: also add to "🔥 Absolute Bangers" playlist
      if (direction === "super") {
        const bangersId = await getOrCreateBangersPlaylist(
          supabase, accessToken, tokens.user_id, tokens.spotify_user_id
        );
        if (bangersId) {
          await addTracksToPlaylist(accessToken, bangersId, [`spotify:track:${track_id}`]);
        }
      }

      await addTracksToPlaylist(accessToken, tokens.playlist_id, [
        `spotify:track:${track_id}`,
      ]);

      const { data: plRow } = await supabase
        .from("playlists")
        .select("total_tracks_added")
        .eq("user_id", tokens.user_id)
        .maybeSingle();

      if (plRow) {
        const newCount = plRow.total_tracks_added + 1;
        await supabase
          .from("playlists")
          .update({ total_tracks_added: newCount })
          .eq("user_id", tokens.user_id);
        playlistTrackCount = newCount;
      }
    } catch (err) {
      console.error("Failed to add track to playlist:", err);
    }
  }

  // Quick achievement check (milestone-based only — fast)
  newlyUnlocked = await checkMilestoneAchievements(supabase, tokens.user_id);

  return NextResponse.json({ ok: true, playlistTrackCount, newlyUnlocked });
}

async function getOrCreateBangersPlaylist(
  supabase: ReturnType<typeof import("@/lib/supabase").createServiceRoleClient>,
  accessToken: string,
  userId: string,
  spotifyUserId: string
): Promise<string | null> {
  try {
    const { data: existing } = await supabase
      .from("playlists")
      .select("spotify_playlist_id")
      .eq("user_id", userId)
      .ilike("playlist_name", "%Absolute Bangers%")
      .maybeSingle();

    if (existing) return existing.spotify_playlist_id;

    // Create it on Spotify
    const pl = await createPlaylist(accessToken, spotifyUserId, "🔥 Absolute Bangers");
    await supabase.from("playlists").insert({
      user_id: userId,
      spotify_playlist_id: pl.id,
      playlist_name: "🔥 Absolute Bangers",
      total_tracks_added: 0,
    });
    return pl.id;
  } catch {
    return null;
  }
}

async function checkMilestoneAchievements(
  supabase: ReturnType<typeof import("@/lib/supabase").createServiceRoleClient>,
  userId: string
): Promise<string[]> {
  try {
    const { count: total } = await supabase
      .from("swipe_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { count: rights } = await supabase
      .from("swipe_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("direction", "right");

    const milestones: Record<string, string> = {};
    if (total === 1)   milestones["first_swipe"] = "first_swipe";
    if (rights === 1)  milestones["first_save"]  = "first_save";
    if (rights === 10) milestones["ten_saves"]   = "ten_saves";
    if (total === 100) milestones["century_swiper"] = "century_swiper";
    if (total === 500) milestones["five_hundred"]   = "five_hundred";
    if (rights === 100) milestones["taste_master"]  = "taste_master";

    return Object.keys(milestones);
  } catch {
    return [];
  }
}
