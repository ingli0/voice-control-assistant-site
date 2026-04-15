"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { extractColors, getContrastColor } from "@/lib/colors";
import { MOOD_PRESETS } from "@/lib/types";
import type { TrackCard } from "@/lib/types";
import AudioPlayer from "./AudioPlayer";

interface Props {
  track: TrackCard;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
  stackIndex: number; // 0 = top, 1 = second, 2 = third
}

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 300;

export default function SwipeCard({ track, onSwipe, isTop, stackIndex }: Props) {
  const [colors, setColors] = useState<string[]>(["#1DB954", "#191414"]);
  const [swiped, setSwiped] = useState<"left" | "right" | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const rightOpacity = useTransform(x, [0, 80], [0, 1]);
  const leftOpacity = useTransform(x, [-80, 0], [1, 0]);

  const coverUrl = track.album.images[0]?.url;
  const textColor = getContrastColor(colors[0] ?? "#191414");
  const year = track.album.release_date?.split("-")[0] ?? "—";
  const moodPreset = track.moodMatch ? MOOD_PRESETS[track.moodMatch] : null;

  useEffect(() => {
    if (coverUrl && isTop) {
      extractColors(coverUrl).then(setColors);
    }
  }, [coverUrl, isTop]);

  function triggerSwipe(direction: "left" | "right") {
    if (swiped) return;
    setSwiped(direction);
    animate(x, direction === "right" ? 600 : -600, {
      duration: 0.35,
      ease: "easeOut",
      onComplete: () => onSwipe(direction),
    });
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const { offset, velocity } = info;
    if (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      triggerSwipe("right");
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      triggerSwipe("left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/track/${track.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    });
  }

  // Stack effect for cards below top
  const scale = 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 14;

  if (stackIndex > 2) return null;

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        scale,
        y: yOffset,
        zIndex: 10 - stackIndex,
        transformOrigin: "center bottom",
      }}
      animate={{ scale, y: yOffset }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <motion.div
        className="swipe-card w-full h-full rounded-3xl overflow-hidden shadow-2xl relative"
        style={{
          x: isTop ? x : undefined,
          rotate: isTop ? rotate : undefined,
          background: `linear-gradient(160deg, ${colors[0] ?? "#282828"} 0%, ${colors[1] ?? "#191414"} 60%, #0a0a0a 100%)`,
          cursor: isTop ? "grab" : "default",
        }}
        drag={isTop ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={isTop ? handleDragEnd : undefined}
        whileTap={isTop ? { cursor: "grabbing" } : undefined}
      >
        {/* Album art with blurred background */}
        {coverUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover opacity-20 blur-2xl scale-110"
              sizes="500px"
              aria-hidden
            />
          </div>
        )}

        <div className="relative z-10 h-full flex flex-col p-5">
          {/* Top badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-wrap gap-1.5">
              {track.isTrending && (
                <span className="mood-badge bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  🔥 Trending
                </span>
              )}
              {moodPreset && (
                <span
                  className="mood-badge border"
                  style={{
                    backgroundColor: moodPreset.color + "25",
                    color: moodPreset.color,
                    borderColor: moodPreset.color + "40",
                  }}
                >
                  {moodPreset.emoji} {moodPreset.label}
                </span>
              )}
            </div>
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm hover:bg-white/20 transition-colors"
            >
              🔗
            </button>
          </div>

          {/* Album Art */}
          <div className="flex-1 flex items-center justify-center py-2">
            {coverUrl ? (
              <motion.div
                className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl"
                whileHover={isTop ? { scale: 1.02 } : {}}
              >
                <Image
                  src={coverUrl}
                  alt={`${track.name} album cover`}
                  fill
                  className="object-cover"
                  sizes="250px"
                  priority={isTop}
                />
              </motion.div>
            ) : (
              <div className="w-48 h-48 rounded-2xl bg-spotify-card flex items-center justify-center text-5xl">
                🎵
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="space-y-3">
            <div>
              <h2
                className="text-xl font-black truncate"
                style={{ color: textColor === "white" ? "#ffffff" : "#000000" }}
              >
                {track.name}
              </h2>
              <p
                className="text-sm font-medium truncate"
                style={{
                  color: textColor === "white" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                }}
              >
                {track.artists.map((a) => a.name).join(", ")}
              </p>
            </div>

            {/* Metadata row */}
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <MetaBadge label={track.album.name} icon="💿" />
              <MetaBadge label={year} icon="📅" />
              <MetaBadge label={`${track.popularity}%`} icon="⭐" />
              {track.genres[0] && <MetaBadge label={track.genres[0]} icon="🎭" />}
            </div>

            {/* Genre tags */}
            {track.genres.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {track.genres.slice(1).map((g) => (
                  <span
                    key={g}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Audio player */}
            {isTop && (
              <div className="pt-1">
                <AudioPlayer previewUrl={track.preview_url} autoPlay={true} />
              </div>
            )}

            {/* Swipe hint */}
            {isTop && (
              <p className="text-center text-[10px] text-white/30 pb-1">
                ← Skip &nbsp;|&nbsp; Save →
              </p>
            )}
          </div>
        </div>

        {/* Swipe overlays */}
        {isTop && (
          <>
            <motion.div
              className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-3xl pointer-events-none"
              style={{ opacity: rightOpacity }}
            >
              <div className="border-4 border-green-400 rounded-2xl px-6 py-3 rotate-[-15deg]">
                <span className="text-green-400 text-4xl font-black">SAVE</span>
              </div>
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-3xl pointer-events-none"
              style={{ opacity: leftOpacity }}
            >
              <div className="border-4 border-red-400 rounded-2xl px-6 py-3 rotate-[15deg]">
                <span className="text-red-400 text-4xl font-black">SKIP</span>
              </div>
            </motion.div>
          </>
        )}

        {/* Share toast */}
        {showShareToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 text-black text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-50">
            Link copied!
          </div>
        )}
      </motion.div>

      {/* Action buttons below card */}
      {isTop && (
        <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => triggerSwipe("left")}
            className="w-14 h-14 rounded-full bg-spotify-dark border-2 border-red-400/50 flex items-center justify-center text-2xl shadow-lg hover:border-red-400 transition-colors"
          >
            ✕
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => triggerSwipe("right")}
            className="w-16 h-16 rounded-full bg-spotify-green flex items-center justify-center text-2xl shadow-lg glow-green"
          >
            ♥
          </motion.button>
          <a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 rounded-full bg-spotify-dark border-2 border-white/20 flex items-center justify-center shadow-lg hover:border-white/40 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </a>
        </div>
      )}
    </motion.div>
  );
}

function MetaBadge({ label, icon }: { label: string; icon: string }) {
  return (
    <span className="flex items-center gap-1 bg-black/20 text-white/70 px-2 py-0.5 rounded-full">
      {icon} {label}
    </span>
  );
}
