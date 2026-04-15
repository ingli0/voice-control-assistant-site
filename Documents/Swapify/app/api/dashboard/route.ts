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

  // Personal swipe stats
  const { data: swipes } = await supabase
    .from("swipe_events")
    .select("direction, genre, track_id, track_name, artist_name, swiped_at")
    .eq("user_id", userId)
    .order("swiped_at", { ascending: false });

  const allSwipes = swipes ?? [];
  const rights = allSwipes.filter((s: { direction: string }) => s.direction === "right");
  const lefts = allSwipes.filter((s: { direction: string }) => s.direction === "left");

  // Favorite genres (from right-swipes)
  const genreCount = new Map<string, number>();
  for (const s of rights) {
    if (s.genre) {
      genreCount.set(s.genre, (genreCount.get(s.genre) ?? 0) + 1);
    }
  }
  const favoriteGenres = [...genreCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([genre, count]) => ({ genre, count }));

  // Swipes over time (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateMap = new Map<string, { right: number; left: number }>();

  for (const s of allSwipes) {
    const date = s.swiped_at.slice(0, 10);
    if (new Date(date) < thirtyDaysAgo) continue;
    const entry = dateMap.get(date) ?? { right: 0, left: 0 };
    if (s.direction === "right") entry.right++;
    else entry.left++;
    dateMap.set(date, entry);
  }

  const swipesOverTime = [...dateMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, counts]) => ({ date, ...counts }));

  // Top saved tracks
  const savedCount = new Map<string, { track_name: string; artist_name: string; count: number }>();
  for (const s of rights) {
    const entry = savedCount.get(s.track_id) ?? { track_name: s.track_name, artist_name: s.artist_name, count: 0 };
    entry.count++;
    savedCount.set(s.track_id, entry);
  }
  const topSavedTracks = [...savedCount.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([track_id, data]) => ({ track_id, ...data }));

  // Global stats
  const { count: globalSwipes } = await supabase
    .from("swipe_events")
    .select("*", { count: "exact", head: true });

  const { count: globalRight } = await supabase
    .from("swipe_events")
    .select("*", { count: "exact", head: true })
    .eq("direction", "right");

  const { count: totalPlaylists } = await supabase
    .from("playlists")
    .select("*", { count: "exact", head: true });

  // Global leaderboard — most saved tracks
  const { data: leaderboardRows } = await supabase
    .from("swipe_events")
    .select("track_id, track_name, artist_name")
    .eq("direction", "right")
    .limit(10000);

  const globalTrackCount = new Map<string, { track_name: string; artist_name: string; count: number }>();
  for (const row of leaderboardRows ?? []) {
    const e = globalTrackCount.get(row.track_id) ?? { track_name: row.track_name, artist_name: row.artist_name, count: 0 };
    e.count++;
    globalTrackCount.set(row.track_id, e);
  }
  const leaderboard = [...globalTrackCount.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([track_id, data]) => ({ track_id, ...data }));

  return NextResponse.json({
    personal: {
      totalSwipes: allSwipes.length,
      rightSwipes: rights.length,
      leftSwipes: lefts.length,
      acceptanceRate: allSwipes.length ? Math.round((rights.length / allSwipes.length) * 100) : 0,
      favoriteGenres,
      swipesOverTime,
      topSavedTracks,
    },
    global: {
      totalSwipes: globalSwipes ?? 0,
      rightSwipes: globalRight ?? 0,
      totalPlaylists: totalPlaylists ?? 0,
      leaderboard,
    },
  });
}
