"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface TasteData {
  totalRightSwipes: number;
  avgFeatures: {
    energy: number;
    valence: number;
    danceability: number;
    acousticness: number;
    intensity: number;
    underground: number;
  };
  topGenres: { genre: string; count: number }[];
  moodDistribution: { preset: string; count: number }[];
  hourCount: number[];
  archetype: { label: string; emoji: string; description: string };
}

export default function TasteDNA() {
  const [data, setData] = useState<TasteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/taste")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <TasteSkeleton />;
  if (!data || data.totalRightSwipes < 3) {
    return (
      <div className="glass rounded-2xl p-6 text-center space-y-2">
        <p className="text-2xl">🧬</p>
        <p className="text-white font-semibold">Taste DNA</p>
        <p className="text-spotify-text text-sm">
          Save at least 3 tracks to unlock your audio fingerprint.
        </p>
      </div>
    );
  }

  const radarData = [
    { subject: "Energy",       value: data.avgFeatures.energy },
    { subject: "Happiness",    value: data.avgFeatures.valence },
    { subject: "Danceability", value: data.avgFeatures.danceability },
    { subject: "Acoustic",     value: data.avgFeatures.acousticness },
    { subject: "Intensity",    value: data.avgFeatures.intensity },
    { subject: "Uniqueness",   value: data.avgFeatures.underground },
  ];

  // Peak hour
  const peakHour = data.hourCount.indexOf(Math.max(...data.hourCount));
  const peakLabel =
    peakHour < 6 ? "Late Night 🌙"
    : peakHour < 12 ? "Morning ☀️"
    : peakHour < 18 ? "Afternoon 🌤️"
    : "Evening 🌆";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Archetype card */}
      <div className="glass rounded-2xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-spotify-green/10 flex items-center justify-center text-4xl flex-shrink-0">
          {data.archetype.emoji}
        </div>
        <div>
          <p className="text-xs text-spotify-green uppercase tracking-widest font-bold mb-0.5">
            Your Taste Archetype
          </p>
          <p className="text-xl font-black text-white">{data.archetype.label}</p>
          <p className="text-sm text-spotify-text mt-0.5">{data.archetype.description}</p>
        </div>
      </div>

      {/* Radar */}
      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">Audio Fingerprint</p>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#b3b3b3", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ background: "#282828", border: "none", borderRadius: 10, fontSize: 12 }}
              formatter={(v: number) => [`${v}%`, ""]}
            />
            <Radar
              name="Your DNA"
              dataKey="value"
              stroke="#1DB954"
              fill="#1DB954"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black gradient-text">{data.totalRightSwipes}</p>
          <p className="text-[10px] text-spotify-text mt-0.5">Tracks Saved</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-white">{data.topGenres[0]?.genre ?? "—"}</p>
          <p className="text-[10px] text-spotify-text mt-0.5">Top Genre</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-yellow-400">{peakLabel.split(" ")[0]}</p>
          <p className="text-[10px] text-spotify-text mt-0.5">Peak Time</p>
        </div>
      </div>

      {/* Hour heatmap */}
      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">When You Discover</p>
        <div className="flex items-end gap-0.5 h-12">
          {data.hourCount.map((count, hour) => {
            const maxCount = Math.max(...data.hourCount, 1);
            const pct = (count / maxCount) * 100;
            return (
              <motion.div
                key={hour}
                title={`${hour}:00 — ${count} swipes`}
                className="flex-1 rounded-t-sm cursor-default"
                style={{
                  height: `${Math.max(pct, 4)}%`,
                  backgroundColor: pct > 60 ? "#1DB954" : pct > 30 ? "#1DB95480" : "#1DB95420",
                }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, 4)}%` }}
                transition={{ delay: hour * 0.02, duration: 0.4 }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-spotify-text/50 mt-1">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </div>

      {/* Top genres */}
      {data.topGenres.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-bold text-white mb-3">Genre Breakdown</p>
          <div className="space-y-2">
            {data.topGenres.map((g, i) => {
              const max = data.topGenres[0].count;
              const pct = Math.round((g.count / max) * 100);
              return (
                <div key={g.genre} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white capitalize">{g.genre}</span>
                    <span className="text-spotify-text">{g.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.06, duration: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

const GENRE_COLORS = ["#1DB954", "#FF6B35", "#4ECDC4", "#FFD93D", "#FF3CAC", "#7B8CDE", "#6BCB77", "#D4A574"];

function TasteSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton rounded-2xl h-24" />
      <div className="skeleton rounded-2xl h-56" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton rounded-xl h-16" />)}
      </div>
    </div>
  );
}
