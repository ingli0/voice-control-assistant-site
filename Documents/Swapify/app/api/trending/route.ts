import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export const revalidate = 3600; // ISR: revalidate every hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");

  const supabase = createServiceRoleClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all right-swipes from last 7 days
  let query = supabase
    .from("swipe_events")
    .select("track_id, track_name, artist_name, genre, swiped_at")
    .eq("direction", "right")
    .gte("swiped_at", sevenDaysAgo);

  if (genre) {
    query = query.eq("genre", genre);
  }

  const { data: rows } = await query.limit(50000);

  // Aggregate
  const trackMap = new Map<string, {
    track_name: string;
    artist_name: string;
    genres: Set<string>;
    count: number;
    byDay: Map<string, number>;
  }>();

  for (const row of rows ?? []) {
    const entry = trackMap.get(row.track_id) ?? {
      track_name: row.track_name,
      artist_name: row.artist_name,
      genres: new Set<string>(),
      count: 0,
      byDay: new Map<string, number>(),
    };

    entry.count++;
    if (row.genre) entry.genres.add(row.genre);

    const day = row.swiped_at.slice(0, 10);
    entry.byDay.set(day, (entry.byDay.get(day) ?? 0) + 1);

    trackMap.set(row.track_id, entry);
  }

  // Sort by count and build result
  const sorted = [...trackMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 50);

  // Build 7-day sparkline aligned to last 7 days
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }

  const trending = sorted.map(([track_id, data], idx) => ({
    track_id,
    track_name: data.track_name,
    artist_name: data.artist_name,
    right_swipes: data.count,
    rank: idx + 1,
    genres: [...data.genres].slice(0, 3),
    sparkline: days.map((d) => data.byDay.get(d) ?? 0),
    album_cover: "",
  }));

  // Unique genres list for filter UI
  const allGenres = new Set<string>();
  for (const [, data] of trackMap) {
    for (const g of data.genres) allGenres.add(g);
  }

  return NextResponse.json({
    trending,
    genres: [...allGenres].sort().slice(0, 30),
    updatedAt: new Date().toISOString(),
  });
}
