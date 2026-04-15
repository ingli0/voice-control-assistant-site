import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getSpotifyUser, createPlaylist } from "@/lib/spotify";
import { createServiceRoleClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const savedState = request.cookies.get("spotify_oauth_state")?.value;

  if (error) {
    return NextResponse.redirect(new URL("/login?error=access_denied", request.url));
  }

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  try {
    const tokens = await exchangeCode(code);
    const spotifyUser = await getSpotifyUser(tokens.access_token);

    const supabase = createServiceRoleClient();

    // Upsert user
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("spotify_user_id", spotifyUser.id)
      .maybeSingle() as { data: { id: string } | null; error: unknown };

    let dbUserId: string;
    let playlistId: string | null = null;

    if (existingUser) {
      dbUserId = existingUser.id;

      // Update last login
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", dbUserId);

      // Get existing playlist
      const { data: plRow } = await supabase
        .from("playlists")
        .select("spotify_playlist_id")
        .eq("user_id", dbUserId)
        .maybeSingle();

      playlistId = plRow?.spotify_playlist_id ?? null;
    } else {
      // Create new user
      const { data: newUser, error: userErr } = await supabase
        .from("users")
        .insert({
          spotify_user_id: spotifyUser.id,
          display_name: spotifyUser.display_name ?? spotifyUser.id,
          email: spotifyUser.email ?? "",
          avatar_url: spotifyUser.images?.[0]?.url ?? null,
        })
        .select("id")
        .single();

      if (userErr || !newUser) throw new Error("Failed to create user");
      dbUserId = newUser.id;
    }

    // Create Spotify playlist if none exists
    if (!playlistId) {
      const playlist = await createPlaylist(tokens.access_token, spotifyUser.id);
      playlistId = playlist.id;

      await supabase.from("playlists").insert({
        user_id: dbUserId,
        spotify_playlist_id: playlist.id,
        playlist_name: "🎵 Discovered via Swipe",
        total_tracks_added: 0,
      });
    }

    // Create a new session
    const { data: session } = await supabase
      .from("sessions")
      .insert({ user_id: dbUserId })
      .select("id")
      .single();

    const tokenPayload = {
      ...tokens,
      user_id: dbUserId,
      spotify_user_id: spotifyUser.id,
      display_name: spotifyUser.display_name,
      avatar_url: spotifyUser.images?.[0]?.url ?? null,
      playlist_id: playlistId,
      session_id: session?.id ?? null,
    };

    const res = NextResponse.redirect(new URL("/discover", request.url));

    res.cookies.delete("spotify_oauth_state");
    res.cookies.set("spotify_tokens", JSON.stringify(tokenPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}
