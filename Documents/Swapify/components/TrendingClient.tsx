"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NavBar from "./NavBar";
import type { TrendingTrack } from "@/lib/types";

// Inline sparkline since react-sparklines may not be installed — we'll render with SVG
function SparklineBar({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const width = 60;
  const height = 24;
  const barW = width / data.length - 1;

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      {data.map((v, i) => {
        const h = (v / max) * height;
        return (
          <rect
            key={i}
            x={i * (barW + 1)}
            y={height - h}
            width={barW}
            height={h}
            fill="#1DB954"
            rx={1}
            opacity={0.7}
          />
        );
      })}
    </svg>
  );
}

export default function TrendingClient() {
  const [trending, setTrending] = useState<TrendingTrack[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const url = selectedGenre
      ? `/api/trending?genre=${encodeURIComponent(selectedGenre)}`
      : "/api/trending";

    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setTrending(data.trending ?? []);
        setGenres(data.genres ?? []);
        setUpdatedAt(data.updatedAt ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedGenre]);

  return (
    <div className="min-h-screen bg-spotify-dark">
      <NavBar />
      <main className="pt-4 md:pt-20 pb-24 px-4 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            🔥 Trending
          </h1>
          {updatedAt && (
            <span className="text-[10px] text-spotify-text/50">
              Updated {new Date(updatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Genre filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <GenreChip
            label="All Genres"
            active={selectedGenre === null}
            onClick={() => setSelectedGenre(null)}
          />
          {genres.slice(0, 20).map((g) => (
            <GenreChip
              key={g}
              label={g}
              active={selectedGenre === g}
              onClick={() => setSelectedGenre(g === selectedGenre ? null : g)}
            />
          ))}
        </div>

        {loading ? (
          <TrendingSkeleton />
        ) : trending.length === 0 ? (
          <div className="text-center py-20 text-spotify-text">
            <p className="text-4xl mb-3">📊</p>
            <p>No trending data yet. Start swiping!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trending.map((track, i) => (
              <motion.div
                key={track.track_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {i === 0 ? (
                    <span className="text-2xl">🥇</span>
                  ) : i === 1 ? (
                    <span className="text-2xl">🥈</span>
                  ) : i === 2 ? (
                    <span className="text-2xl">🥉</span>
                  ) : (
                    <span className="text-lg font-black text-spotify-text">#{track.rank}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">{track.track_name}</p>
                    {i < 10 && (
                      <span className="mood-badge bg-orange-500/20 text-orange-400 border border-orange-500/30 flex-shrink-0">
                        🔥 Top 10
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-spotify-text truncate">{track.artist_name}</p>
                  {track.genres.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {track.genres.map((g) => (
                        <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-spotify-green font-bold text-sm">{track.right_swipes}</span>
                    <span className="text-xs text-spotify-text">saves</span>
                  </div>
                  {track.sparkline.some((v) => v > 0) && (
                    <SparklineBar data={track.sparkline} />
                  )}
                </div>

                {/* Open on Spotify */}
                <a
                  href={`https://open.spotify.com/track/${track.track_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1DB954">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function GenreChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        active
          ? "bg-spotify-green text-black"
          : "glass text-spotify-text hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function TrendingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton rounded-2xl h-20" />
      ))}
    </div>
  );
}
