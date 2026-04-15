"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import NavBar from "./NavBar";
import TasteDNA from "./TasteDNA";
import AchievementsPanel from "./AchievementsPanel";

interface Stats {
  personal: {
    totalSwipes: number;
    rightSwipes: number;
    leftSwipes: number;
    acceptanceRate: number;
    favoriteGenres: { genre: string; count: number }[];
    swipesOverTime: { date: string; right: number; left: number }[];
    topSavedTracks: { track_id: string; track_name: string; artist_name: string; count: number }[];
  };
  global: {
    totalSwipes: number;
    rightSwipes: number;
    totalPlaylists: number;
    leaderboard: { track_id: string; track_name: string; artist_name: string; count: number }[];
  };
}

const PIE_COLORS = ["#1DB954", "#FF6B35", "#4ECDC4", "#FFD93D", "#FF3CAC", "#7B8CDE", "#6BCB77", "#D4A574"];

export default function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"personal" | "global" | "dna" | "achievements">("personal");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-spotify-dark">
      <NavBar />
      <main className="pt-4 md:pt-20 pb-24 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-white">Analytics</h1>
            <div className="flex gap-1 glass rounded-full p-1 overflow-x-auto">
              {([
                { id: "personal",     label: "Stats" },
                { id: "global",       label: "Global" },
                { id: "dna",          label: "🧬 DNA" },
                { id: "achievements", label: "🏆 Badges" },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === t.id
                      ? "bg-spotify-green text-black"
                      : "text-spotify-text hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "dna" ? (
            <TasteDNA />
          ) : activeTab === "achievements" ? (
            <AchievementsPanel />
          ) : loading ? (
            <DashboardSkeleton />
          ) : !stats ? (
            <div className="text-center py-20 text-spotify-text">Failed to load stats.</div>
          ) : activeTab === "personal" ? (
            <PersonalDashboard stats={stats.personal} />
          ) : (
            <GlobalDashboard stats={stats.global} />
          )}
        </motion.div>
      </main>
    </div>
  );
}

function PersonalDashboard({ stats }: { stats: Stats["personal"] }) {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Swipes" value={stats.totalSwipes} icon="🎵" />
        <KpiCard label="Saved" value={stats.rightSwipes} icon="💚" color="text-spotify-green" />
        <KpiCard label="Skipped" value={stats.leftSwipes} icon="👈" color="text-red-400" />
        <KpiCard label="Accept Rate" value={`${stats.acceptanceRate}%`} icon="📊" color="text-yellow-400" />
      </div>

      {/* Swipes over time */}
      {stats.swipesOverTime.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-4">Swipes Over Time (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.swipesOverTime}>
              <defs>
                <linearGradient id="rightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1DB954" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="leftGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis width={30} />
              <Tooltip
                contentStyle={{ background: "#282828", border: "none", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "#fff" }}
              />
              <Area type="monotone" dataKey="right" stroke="#1DB954" fill="url(#rightGrad)" name="Saved" />
              <Area type="monotone" dataKey="left" stroke="#ef4444" fill="url(#leftGrad)" name="Skipped" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Favorite genres + Top saved tracks */}
      <div className="grid md:grid-cols-2 gap-4">
        {stats.favoriteGenres.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-4">Favorite Genres</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.favoriteGenres}
                  dataKey="count"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {stats.favoriteGenres.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#282828", border: "none", borderRadius: 12, fontSize: 12 }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-[11px] text-spotify-text">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats.topSavedTracks.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-4">Most Saved Tracks</h3>
            <div className="space-y-2">
              {stats.topSavedTracks.slice(0, 5).map((t, i) => (
                <div key={t.track_id} className="flex items-center gap-3">
                  <span className="text-xs text-spotify-text w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{t.track_name}</p>
                    <p className="text-xs text-spotify-text truncate">{t.artist_name}</p>
                  </div>
                  <span className="text-xs text-spotify-green font-bold">×{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GlobalDashboard({ stats }: { stats: Stats["global"] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total Swipes" value={stats.totalSwipes} icon="🌍" />
        <KpiCard label="Tracks Saved" value={stats.rightSwipes} icon="💚" color="text-spotify-green" />
        <KpiCard label="Playlists" value={stats.totalPlaylists} icon="📋" color="text-blue-400" />
      </div>

      {stats.leaderboard.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-4">🏆 Most Saved Tracks Globally</h3>
          <div className="space-y-3">
            {stats.leaderboard.map((t, i) => (
              <motion.div
                key={t.track_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <span className={`text-lg font-black w-6 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-spotify-text"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{t.track_name}</p>
                  <p className="text-xs text-spotify-text truncate">{t.artist_name}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-spotify-green font-bold">
                  💚 {t.count}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {stats.leaderboard.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-4">Save Count Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.leaderboard.slice(0, 10)}>
              <CartesianGrid />
              <XAxis dataKey="track_name" tick={false} />
              <YAxis width={30} />
              <Tooltip
                contentStyle={{ background: "#282828", border: "none", borderRadius: 12, fontSize: 12 }}
                formatter={(v, _n, props) => [v, props.payload.track_name]}
              />
              <Bar dataKey="count" fill="#1DB954" radius={[4, 4, 0, 0]} name="Saves" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  color = "text-white",
}: {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-2xl p-4 space-y-1"
    >
      <p className="text-lg">{icon}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-spotify-text">{label}</p>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton rounded-2xl h-24" />
        ))}
      </div>
      <div className="skeleton rounded-2xl h-56" />
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton rounded-2xl h-56" />
        <div className="skeleton rounded-2xl h-56" />
      </div>
    </div>
  );
}
