import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { ACHIEVEMENTS, type AchievementId } from "@/lib/achievements";

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

  // Gather all the stats we need to evaluate achievements
  const [swipesRes, sessionsRes, playlistRes] = await Promise.all([
    supabase
      .from("swipe_events")
      .select("direction, genre, swiped_at, mood_preset")
      .eq("user_id", userId),
    supabase
      .from("sessions")
      .select("total_swipes, session_start")
      .eq("user_id", userId),
    supabase
      .from("playlists")
      .select("total_tracks_added")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const swipes = swipesRes.data ?? [];
  const sessions = sessionsRes.data ?? [];
  const playlist = playlistRes.data;

  const rights = swipes.filter((s: { direction: string }) => s.direction === "right");
  const genres = new Set(rights.map((s: { genre: string | null }) => s.genre).filter(Boolean));
  const presets = new Set(swipes.map((s: { mood_preset: string | null }) => s.mood_preset).filter(Boolean));

  // Night owl: swipe between midnight and 4am
  const nightSwipes = swipes.filter((s: { swiped_at: string }) => {
    const h = new Date(s.swiped_at).getHours();
    return h >= 0 && h < 4;
  });

  // Early bird: swipe between 5am and 7am
  const earlySwipes = swipes.filter((s: { swiped_at: string }) => {
    const h = new Date(s.swiped_at).getHours();
    return h >= 5 && h < 7;
  });

  // Multi-day streak
  const swipeDays = new Set<string>(swipes.map((s: { swiped_at: string }) => s.swiped_at.slice(0, 10)));
  const streak = calcStreak(swipeDays);

  const stats = {
    totalSwipes: swipes.length,
    totalRights: rights.length,
    uniqueGenres: genres.size,
    uniquePresets: presets.size,
    nightSwipes: nightSwipes.length,
    earlySwipes: earlySwipes.length,
    totalSessions: sessions.length,
    savedToPlaylist: playlist?.total_tracks_added ?? 0,
    streak,
  };

  // Evaluate which achievements are unlocked
  const unlocked: AchievementId[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (ach.check(stats)) unlocked.push(ach.id);
  }

  return NextResponse.json({
    achievements: ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlocked.includes(a.id),
      check: undefined, // don't serialize the function
    })),
    unlockedCount: unlocked.length,
    stats,
  });
}

function calcStreak(days: Set<string>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (!days.has(d.toISOString().slice(0, 10))) break;
    streak++;
  }
  return streak;
}
