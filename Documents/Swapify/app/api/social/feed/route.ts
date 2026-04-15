import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

function getTokens(request: NextRequest) {
  const cookie = request.cookies.get("spotify_tokens");
  if (!cookie) return null;
  try { return JSON.parse(cookie.value); } catch { return null; }
}

export async function GET(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceRoleClient();
  const userId = tokens.user_id;

  // Get accepted friends
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");

  const friendIds = (friendships ?? []).map((f: { requester_id: string; addressee_id: string }) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  );

  if (friendIds.length === 0) {
    return NextResponse.json({ feed: [] });
  }

  // Get friends' recent right-swipes (who have public or friends privacy)
  const { data: friendUsers } = await supabase
    .from("users")
    .select("id, display_name, avatar_url, privacy")
    .in("id", friendIds)
    .in("privacy", ["public", "friends"]);

  const visibleFriendIds = (friendUsers ?? []).map((u: { id: string }) => u.id);

  if (visibleFriendIds.length === 0) {
    return NextResponse.json({ feed: [] });
  }

  const { data: swipes } = await supabase
    .from("swipe_events")
    .select("id, user_id, track_id, track_name, artist_name, swiped_at")
    .eq("direction", "right")
    .in("user_id", visibleFriendIds)
    .order("swiped_at", { ascending: false })
    .limit(50);

  const userMap = new Map(
    (friendUsers ?? []).map((u: { id: string; display_name: string; avatar_url: string | null }) => [u.id, u])
  );

  const feed = (swipes ?? []).map((s: {
    id: string;
    user_id: string;
    track_id: string;
    track_name: string;
    artist_name: string;
    swiped_at: string;
  }) => ({
    id: s.id,
    user: userMap.get(s.user_id) ?? { id: s.user_id, display_name: "Unknown", avatar_url: null },
    track_id: s.track_id,
    track_name: s.track_name,
    artist_name: s.artist_name,
    swiped_at: s.swiped_at,
  }));

  return NextResponse.json({ feed });
}
