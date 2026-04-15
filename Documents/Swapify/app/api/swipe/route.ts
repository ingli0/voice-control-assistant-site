import { NextRequest, NextResponse } from "next/server";
import { addTracksToPlaylist, refreshAccessToken } from "@/lib/spotify";
import { createServiceRoleClient } from "@/lib/supabase";

function getTokens(request: NextRequest) {
  const cookie = request.cookies.get("spotify_tokens");
  if (!cookie) return null;
  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { track_id, track_name, artist_name, genre, direction, mood_preset, session_id } = body;

  if (!track_id || !direction) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Record swipe event
  await supabase.from("swipe_events").insert({
    user_id: tokens.user_id,
    track_id,
    track_name,
    artist_name,
    genre: genre ?? null,
    direction,
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
        rights_count: session.rights_count + (direction === "right" ? 1 : 0),
        lefts_count: session.lefts_count + (direction === "left" ? 1 : 0),
      }).eq("id", session_id);
    }
  }

  let playlistTrackCount: number | null = null;

  // If swiped right → add to Spotify playlist
  if (direction === "right" && tokens.playlist_id) {
    try {
      let accessToken = tokens.access_token;
      if (Date.now() > tokens.expires_at - 30_000) {
        const newTokens = await refreshAccessToken(tokens.refresh_token);
        accessToken = newTokens.access_token;
      }

      await addTracksToPlaylist(accessToken, tokens.playlist_id, [
        `spotify:track:${track_id}`,
      ]);

      // Update playlist track count in DB
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
      // Don't fail the whole request for this
    }
  }

  return NextResponse.json({ ok: true, playlistTrackCount });
}
