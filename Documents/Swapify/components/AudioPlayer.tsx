"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  previewUrl: string | null;
  autoPlay?: boolean;
}

export default function AudioPlayer({ previewUrl, autoPlay = true }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (!previewUrl) return;

    const audio = new Audio(previewUrl);
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    });
    audio.addEventListener("ended", () => {
      setPlaying(false);
      setProgress(0);
    });

    if (autoPlay) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      setPlaying(false);
      setProgress(0);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  }

  if (!previewUrl) {
    return (
      <div className="flex items-center gap-2 text-xs text-spotify-text/50">
        <span>🔇</span>
        <span>No preview available</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Controls row */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={toggle}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center text-black shadow-lg flex-shrink-0"
        >
          <AnimatePresence mode="wait">
            {playing ? (
              <motion.span
                key="pause"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex gap-0.5"
              >
                <span className="w-1 h-4 bg-black rounded-full" />
                <span className="w-1 h-4 bg-black rounded-full" />
              </motion.span>
            ) : (
              <motion.svg
                key="play"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="w-5 h-5 ml-0.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Waveform / progress */}
        <div className="flex-1 space-y-1">
          {/* Animated waveform when playing */}
          {playing ? (
            <div className="flex items-center gap-0.5 h-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-spotify-green rounded-full"
                  animate={{ height: [`${Math.random() * 60 + 20}%`, `${Math.random() * 60 + 20}%`] }}
                  transition={{
                    duration: 0.4 + Math.random() * 0.4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: i * 0.05,
                  }}
                  style={{ height: "40%" }}
                />
              ))}
            </div>
          ) : (
            <div
              className="h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden"
              onClick={seek}
            >
              <div
                className="h-full bg-spotify-green rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <div className="text-[10px] text-spotify-text/50">30s preview</div>
        </div>

        {/* Volume */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            if (audioRef.current) audioRef.current.volume = v;
          }}
          className="w-14 accent-spotify-green"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
