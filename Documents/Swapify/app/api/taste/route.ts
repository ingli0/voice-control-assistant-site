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

  // Fetch all right-swipe events with mood data
  const { data: rightSwipes } = await supabase
    .from("swipe_events")
    .select("genre, mood_preset, swiped_at")
    .eq("user_id", userId)
    .eq("direction", "right")
    .order("swiped_at", { ascending: false })
    .limit(500);

  const swipes = rightSwipes ?? [];

  // Genre breakdown
  const genreCount = new Map<string, number>();
  for (const s of swipes) {
    if (s.genre) genreCount.set(s.genre, (genreCount.get(s.genre) ?? 0) + 1);
  }
  const topGenres = [...genreCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([genre, count]) => ({ genre, count }));

  // Mood preset distribution
  const moodCount = new Map<string, number>();
  for (const s of swipes) {
    if (s.mood_preset) moodCount.set(s.mood_preset, (moodCount.get(s.mood_preset) ?? 0) + 1);
  }
  const moodDistribution = [...moodCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([preset, count]) => ({ preset, count }));

  // Build audio feature profile from mood presets of right-swipes
  // We use the mood_preset of each right-swipe to reconstruct approximate audio features
  const { MOOD_PRESETS } = await import("@/lib/types");
  let totalEnergy = 0, totalValence = 0, totalDance = 0, totalAcoustic = 0, count = 0;

  for (const s of swipes) {
    if (s.mood_preset && MOOD_PRESETS[s.mood_preset as keyof typeof MOOD_PRESETS]) {
      const p = MOOD_PRESETS[s.mood_preset as keyof typeof MOOD_PRESETS];
      totalEnergy    += p.energy       ?? 0.5;
      totalValence   += p.valence      ?? 0.5;
      totalDance     += p.danceability ?? 0.5;
      totalAcoustic  += p.acousticness ?? 0.3;
      count++;
    }
  }

  const avgFeatures = count > 0
    ? {
        energy:       Math.round((totalEnergy    / count) * 100),
        valence:      Math.round((totalValence   / count) * 100),
        danceability: Math.round((totalDance     / count) * 100),
        acousticness: Math.round((totalAcoustic  / count) * 100),
        // Derived metrics
        intensity:    Math.round(((totalEnergy / count) * 0.7 + (1 - totalValence / count) * 0.3) * 100),
        underground:  Math.round(Math.max(0, 1 - (totalDance / count) * 0.6 - (totalAcoustic / count) * 0.4) * 100),
      }
    : { energy: 50, valence: 50, danceability: 50, acousticness: 30, intensity: 50, underground: 50 };

  // Activity by hour (for Night Owl detection)
  const hourCount = new Array(24).fill(0);
  for (const s of swipes) {
    const hour = new Date(s.swiped_at).getHours();
    hourCount[hour]++;
  }

  // Taste archetype
  const archetype = deriveArchetype(avgFeatures, topGenres[0]?.genre ?? "");

  return NextResponse.json({
    totalRightSwipes: swipes.length,
    avgFeatures,
    topGenres,
    moodDistribution,
    hourCount,
    archetype,
  });
}

function deriveArchetype(
  f: { energy: number; valence: number; danceability: number; acousticness: number },
  topGenre: string
): { label: string; emoji: string; description: string } {
  if (f.acousticness > 60) return { label: "The Purist", emoji: "🎸", description: "You prefer raw, authentic sounds over production polish." };
  if (f.energy > 75 && f.danceability > 65) return { label: "The Raver", emoji: "🕺", description: "High energy, maximum danceability. You live for the drop." };
  if (f.energy > 70 && f.valence < 40) return { label: "The Brooder", emoji: "🌑", description: "Intense but dark. You like music with edge and weight." };
  if (f.valence > 70 && f.energy > 60) return { label: "The Optimist", emoji: "☀️", description: "Upbeat and energetic — your playlist is a mood booster." };
  if (f.valence < 35 && f.energy < 40) return { label: "The Dreamer", emoji: "🌧️", description: "Melancholic and introspective. You feel music deeply." };
  if (f.danceability > 70) return { label: "The Groove Machine", emoji: "💃", description: "Rhythm is everything. You can find the beat in anything." };
  if (f.energy < 40 && f.acousticness > 40) return { label: "The Philosopher", emoji: "🧘", description: "You seek music that creates space for thought." };
  return { label: "The Explorer", emoji: "🧭", description: "Eclectic taste that doesn't fit neatly in one box." };
}
