"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import type { TrackCard } from "@/lib/types";
import SwipeCard from "./SwipeCard";
import CardSkeleton from "./CardSkeleton";
import MoodSelector from "./MoodSelector";
import NavBar from "./NavBar";

interface Props {
  initialData: {
    userId: string;
    spotifyUserId: string;
    displayName: string;
    avatarUrl: string | null;
    playlistId: string | null;
    sessionId: string | null;
    moodPreset: string | null;
  } | null;
}

export default function DiscoverClient({ initialData }: Props) {
  const {
    setUser,
    setSessionId,
    moodSettings,
    playlistId,
    playlistTrackCount,
    setPlaylistTrackCount,
    userId,
    sessionId,
    displayName,
    avatarUrl,
  } = useAppStore();

  const [queue, setQueue] = useState<TrackCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMood, setShowMood] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [swipeStats, setSwipeStats] = useState({ right: 0, left: 0 });
  const fetchingRef = useRef(false);

  // Bootstrap store from server data
  useEffect(() => {
    if (initialData && !userId) {
      setUser({
        userId: initialData.userId,
        spotifyUserId: initialData.spotifyUserId,
        displayName: initialData.displayName,
        avatarUrl: initialData.avatarUrl,
        playlistId: initialData.playlistId,
      });
      if (initialData.sessionId) {
        setSessionId(initialData.sessionId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTracks = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        energy: String(moodSettings.energy),
        valence: String(moodSettings.valence),
        bpmMin: String(moodSettings.bpmMin),
        bpmMax: String(moodSettings.bpmMax),
        danceability: String(moodSettings.danceability),
        acousticness: String(moodSettings.acousticness),
      });
      if (moodSettings.preset) params.set("preset", moodSettings.preset);

      const res = await fetch(`/api/tracks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tracks");

      const data = await res.json();
      setQueue(data.tracks ?? []);
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load tracks. Please try again.");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [moodSettings]);

  useEffect(() => {
    fetchTracks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showNotification(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  async function handleSwipe(direction: "left" | "right", track: TrackCard) {
    setCurrentIndex((i) => i + 1);
    setSwipeStats((s) => ({
      right: s.right + (direction === "right" ? 1 : 0),
      left: s.left + (direction === "left" ? 1 : 0),
    }));

    // Record swipe in background
    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        track_id: track.id,
        track_name: track.name,
        artist_name: track.artists.map((a) => a.name).join(", "),
        genre: track.genres[0] ?? null,
        direction,
        mood_preset: moodSettings.preset,
        session_id: sessionId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (direction === "right") {
        showNotification(`💚 Saved "${track.name}" to your playlist!`);
        if (data.playlistTrackCount != null) {
          setPlaylistTrackCount(data.playlistTrackCount);
        }
      }
    }

    // Pre-fetch more tracks when queue is running low
    const remaining = queue.length - (currentIndex + 1);
    if (remaining <= 3 && !fetchingRef.current) {
      fetchTracks();
    }
  }

  const currentTrack = queue[currentIndex];
  const nextTrack = queue[currentIndex + 1];
  const thirdTrack = queue[currentIndex + 2];

  return (
    <div className="min-h-screen bg-spotify-dark relative">
      <NavBar />

      {/* Page background — blurred album art */}
      <AnimatePresence>
        {currentTrack?.album.images[0]?.url && (
          <motion.div
            key={currentTrack.id}
            className="fixed inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={currentTrack.album.images[0].url}
              alt=""
              fill
              className="object-cover blur-3xl opacity-10 scale-110"
              sizes="100vw"
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex flex-col items-center min-h-screen pt-4 md:pt-20 pb-24 px-4">
        {/* Header */}
        <div className="w-full max-w-sm flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName ?? ""}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : null}
            <div>
              <p className="text-xs text-spotify-text">
                Hi, <span className="text-white font-medium">{displayName?.split(" ")[0]}</span>
              </p>
              <p className="text-[10px] text-spotify-text/50">
                {swipeStats.right + swipeStats.left} swipes this session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Playlist count */}
            {playlistId && (
              <a
                href={`https://open.spotify.com/playlist/${playlistId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-xs hover:bg-white/10 transition-colors"
              >
                <span className="text-spotify-green font-bold">{playlistTrackCount}</span>
                <span className="text-spotify-text">saved</span>
                <svg className="w-3 h-3 text-spotify-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6v2H5v11h11v-5h2v7H3V6h7zm11-3v8l-3.5-3.5-5.793 5.793-1.414-1.414L16.086 6.5 12.5 3H21z" />
                </svg>
              </a>
            )}

            {/* Mood button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMood(true)}
              className="glass px-3 py-1.5 rounded-full text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center gap-1"
            >
              {moodSettings.preset ? (
                <>
                  <span>{import("@/lib/types").then(() => "")}</span>
                  <span className="capitalize">{moodSettings.preset}</span>
                </>
              ) : (
                "🎭 Mood"
              )}
            </motion.button>
          </div>
        </div>

        {/* Session stats strip */}
        <div className="w-full max-w-sm flex items-center gap-3 mb-4">
          <div className="flex-1 glass rounded-xl p-2 text-center">
            <p className="text-lg font-bold text-spotify-green">{swipeStats.right}</p>
            <p className="text-[10px] text-spotify-text">Saved</p>
          </div>
          <div className="flex-1 glass rounded-xl p-2 text-center">
            <p className="text-lg font-bold text-red-400">{swipeStats.left}</p>
            <p className="text-[10px] text-spotify-text">Skipped</p>
          </div>
          <div className="flex-1 glass rounded-xl p-2 text-center">
            <p className="text-lg font-bold text-white">
              {swipeStats.right + swipeStats.left > 0
                ? Math.round((swipeStats.right / (swipeStats.right + swipeStats.left)) * 100)
                : 0}%
            </p>
            <p className="text-[10px] text-spotify-text">Accept rate</p>
          </div>
        </div>

        {/* Card stack */}
        <div className="w-full max-w-sm relative" style={{ height: 520 }}>
          {loading ? (
            <CardSkeleton />
          ) : queue.length === 0 || currentIndex >= queue.length ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 glass rounded-3xl p-8">
              <span className="text-5xl">🎉</span>
              <h3 className="text-xl font-bold text-white">You've seen everything!</h3>
              <p className="text-spotify-text text-sm text-center">
                Adjust your mood or refresh to discover more tracks.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={fetchTracks}
                className="bg-spotify-green text-black font-bold px-6 py-3 rounded-full"
              >
                Load More Tracks
              </motion.button>
            </div>
          ) : (
            <AnimatePresence>
              {[thirdTrack, nextTrack, currentTrack]
                .map((track, reversedIdx) => {
                  if (!track) return null;
                  const stackIndex = 2 - reversedIdx; // 0 = top
                  return (
                    <SwipeCard
                      key={track.id}
                      track={track}
                      isTop={stackIndex === 0}
                      stackIndex={stackIndex}
                      onSwipe={(dir) => handleSwipe(dir, track)}
                    />
                  );
                })
                .reverse()}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Mood sheet */}
      <AnimatePresence>
        {showMood && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMood(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-spotify-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
              <h2 className="text-lg font-bold text-white mb-5">Tune Your Vibe</h2>
              <MoodSelector
                onApply={() => {
                  setShowMood(false);
                  fetchTracks();
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-dark px-5 py-3 rounded-2xl text-sm text-white shadow-xl max-w-xs text-center"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
