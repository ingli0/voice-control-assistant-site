import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("spotify_tokens");
  if (!tokenCookie) {
    return NextResponse.json(null, { status: 401 });
  }

  try {
    const tokens = JSON.parse(tokenCookie.value);
    return NextResponse.json({
      userId: tokens.user_id,
      spotifyUserId: tokens.spotify_user_id,
      displayName: tokens.display_name,
      avatarUrl: tokens.avatar_url,
      playlistId: tokens.playlist_id,
      sessionId: tokens.session_id,
    });
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}
