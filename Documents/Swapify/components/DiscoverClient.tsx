"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import type { TrackCard } from "@/lib/types";
import SwipeCard, { type SwipeCardHandle } from "./SwipeCard";
import CardSkeleton from "./CardSkeleton";
import MoodSelector from "./MoodSelector";
import NavBar from "./NavBar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

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

interface Toast {
  id: number;
  message: string;
  type: "save" | "skip" | "super" | "undo" | "achievement" | "info";
}

export default function DiscoverClient({ initialData }: Props) {
  const {
    setUser, setSessionId,
    moodSettings, playlistId,
    playlistTrackCount, setPlaylistTrackCount,
    userId, sessionId, displayName, avatarUrl,
  } = useAppStore();

  const [queue, setQueue] = useState<TrackCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMood, setShowMood] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [swipeStats, setSwipeStats] = useState({ right: 0, left: 0, super: 0 });

  // Undo state — store up to last 3 swipes
  const [undoStack, setUndoStack] = useState<{ track: TrackCard; direction: "left" | "right" | "super" }[]>([]);

  const fetchingRef = useRef(false);
  const toastCounterRef = useRef(0);
  const topCardRef = useRef<SwipeCardHandle | null>(null);

  // Bootstrap store
  useEffect(() => {
    if (initialData && !userId) {
      setUser({
        userId: initialData.userId,
        spotifyUserId: initialData.spotifyUserId,
        displayName: initialData.displayName,
        avatarUrl: initialData.avatarUrl,
        playlistId: initialData.playlistId,
      });
      if (initialData.sessionId) setSessionId(initialData.sessionId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastCounterRef.current;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchTracks = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        energy:       String(moodSettings.energy),
        valence:      String(moodSettings.valence),
        bpmMin:       String(moodSettings.bpmMin),
        bpmMax:       String(moodSettings.bpmMax),
        danceability: String(moodSettings.danceability),
        acousticness: String(moodSettings.acousticness),
      });
      if (moodSettings.preset) params.set("preset", moodSettings.preset);

      const res = await fetch(`/api/tracks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tracks");
      const data = await res.json();
      setQueue(data.tracks ?? []);
      setCurrentIndex(0);
      setUndoStack([]);
    } catch {
      addToast("Failed to load tracks. Please try again.", "info");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [moodSettings, addToast]);

  useEffect(() => { fetchTracks(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSwipe(direction: "left" | "right" | "super", track: TrackCard) {
    // Push to undo stack
    setUndoStack((prev) => [...prev.slice(-2), { track, direction }]);

    setCurrentIndex((i) => i + 1);
    setSwipeStats((s) => ({
      right: s.right + (direction === "right" ? 1 : 0),
      left:  s.left  + (direction === "left"  ? 1 : 0),
      super: s.super + (direction === "super" ? 1 : 0),
    }));

    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        track_id:    track.id,
        track_name:  track.name,
        artist_name: track.artists.map((a) => a.name).join(", "),
        genre:       track.genres[0] ?? null,
        direction,
        mood_preset: moodSettings.preset,
        session_id:  sessionId,
      }),
    });

    if (res.ok) {
      const data = await res.json();

      if (direction === "right") {
        addToast(`💚 Saved "${track.name}"`, "save");
      } else if (direction === "super") {
        addToast(`🔥 "${track.name}" → Absolute Bangers!`, "super");
      }

      if (data.playlistTrackCount != null) {
        setPlaylistTrackCount(data.playlistTrackCount);
      }

      // Achievement unlock toasts
      for (const id of data.newlyUnlocked ?? []) {
        setTimeout(() => addToast(`🏆 Achievement unlocked: ${id.replace(/_/g, " ")}!`, "achievement"), 800);
      }
    }

    // Pre-fetch when running low
    const remaining = queue.length - (currentIndex + 1);
    if (remaining <= 3 && !fetchingRef.current) fetchTracks();
  }

  function handleUndo() {
    if (undoStack.length === 0) {
      addToast("Nothing to undo", "info");
      return;
    }
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setCurrentIndex((i) => Math.max(0, i - 1));

    // Reverse stat
    setSwipeStats((s) => ({
      right: s.right - (last.direction === "right" ? 1 : 0),
      left:  s.left  - (last.direction === "left"  ? 1 : 0),
      super: s.super - (last.direction === "super" ? 1 : 0),
    }));

    addToast(`↩ Undid swipe on "${last.track.name}"`, "undo");
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onLeft:  () => topCardRef.current?.triggerSwipe("left"),
    onRight: () => topCardRef.current?.triggerSwipe("right"),
    onUp:    () => topCardRef.current?.triggerSwipe("super"),
    onUndo:  handleUndo,
  }, !showMood);

  const currentTrack = queue[currentIndex];
  const nextTrack    = queue[currentIndex + 1];
  const thirdTrack   = queue[currentIndex + 2];

  const totalSwipes = swipeStats.right + swipeStats.left + swipeStats.super;
  const acceptRate  = totalSwipes > 0
    ? Math.round(((swipeStats.right + swipeStats.super) / totalSwipes) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-spotify-dark relative">
      <NavBar />

      {/* Ambient background */}
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

      <main className="relative z-10 flex flex-col items-center min-h-screen pt-4 md:pt-20 pb-28 px-4">
        {/* Header row */}
        <div className="w-full max-w-sm flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {avatarUrl && (
              <Image src={avatarUrl} alt={displayName ?? ""} width={32} height={32} className="rounded-full" />
            )}
            <div>
              <p className="text-xs text-spotify-text">
                Hi, <span className="text-white font-medium">{displayName?.split(" ")[0]}</span>
              </p>
              <p className="text-[10px] text-spotify-text/50">{totalSwipes} swipes this session</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMood(true)}
              className="glass px-3 py-1.5 rounded-full text-xs text-white/80 hover:bg-white/10 transition-colors"
            >
              🎭 {moodSettings.preset ? <span className="capitalize">{moodSettings.preset}</span> : "Mood"}
            </motion.button>
          </div>
        </div>

        {/* Session stats */}
        <div className="w-full max-w-sm grid grid-cols-4 gap-2 mb-4">
          <StatPill value={swipeStats.right + swipeStats.super} label="Saved" color="text-spotify-green" />
          <StatPill value={swipeStats.super} label="Bangers" color="text-yellow-400" />
          <StatPill value={swipeStats.left} label="Skipped" color="text-red-400" />
          <StatPill value={`${acceptRate}%`} label="Rate" color="text-white" />
        </div>

        {/* Card stack */}
        <div className="w-full max-w-sm relative" style={{ height: 520 }}>
          {loading ? (
            <CardSkeleton />
          ) : queue.length === 0 || currentIndex >= queue.length ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 glass rounded-3xl p-8">
              <span className="text-5xl animate-float">🎉</span>
              <h3 className="text-xl font-bold text-white">You've seen everything!</h3>
              <p className="text-spotify-text text-sm text-center">
                Adjust your mood or refresh for more.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={fetchTracks}
                className="bg-spotify-green text-black font-bold px-6 py-3 rounded-full"
              >
                Load More
              </motion.button>
            </div>
          ) : (
            <AnimatePresence>
              {[thirdTrack, nextTrack, currentTrack]
                .map((track, reversedIdx) => {
                  if (!track) return null;
                  const stackIndex = 2 - reversedIdx;
                  const isTop = stackIndex === 0;
                  return (
                    <SwipeCard
                      key={track.id}
                      ref={isTop ? topCardRef : undefined}
                      track={track}
                      isTop={isTop}
                      stackIndex={stackIndex}
                      onSwipe={(dir) => handleSwipe(dir, track)}
                    />
                  );
                })
                .reverse()}
            </AnimatePresence>
          )}
        </div>

        {/* Undo + keyboard hint */}
        {!loading && currentIndex > 0 && undoStack.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUndo}
            className="mt-20 flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-white/70 hover:bg-white/10 transition-colors"
          >
            ↩ Undo last swipe
          </motion.button>
        )}

        {/* Keyboard hint — desktop only */}
        <div className="hidden md:flex items-center gap-4 mt-3 text-[11px] text-white/25">
          <span>← Skip</span>
          <span>↑ Super Like</span>
          <span>→ Save</span>
          <span>U Undo</span>
          <span>Space Play/Pause</span>
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
              <MoodSelector onApply={() => { setShowMood(false); fetchTracks(); }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast stack */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-xl max-w-xs text-center ${
                t.type === "achievement"
                  ? "bg-yellow-400 text-black"
                  : t.type === "super"
                  ? "bg-gradient-to-r from-yellow-500 to-red-500 text-white"
                  : t.type === "save"
                  ? "bg-spotify-green text-black"
                  : t.type === "undo"
                  ? "glass text-white"
                  : "glass-dark text-white"
              }`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatPill({
  value,
  label,
  color,
}: {
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-2 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-spotify-text">{label}</p>
    </div>
  );
}
