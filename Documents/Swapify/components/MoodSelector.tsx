"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOOD_PRESETS } from "@/lib/types";
import type { MoodPreset } from "@/lib/types";

interface Props {
  onApply: () => void;
}

export default function MoodSelector({ onApply }: Props) {
  const { moodSettings, setMoodPreset, setMood } = useAppStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localMood, setLocalMood] = useState(moodSettings);

  function handlePreset(preset: MoodPreset) {
    setMoodPreset(preset);
    const p = MOOD_PRESETS[preset];
    setLocalMood({
      preset,
      energy: p.energy ?? 0.5,
      valence: p.valence ?? 0.5,
      bpmMin: (p.tempo ?? 100) - 20,
      bpmMax: (p.tempo ?? 100) + 20,
      danceability: p.danceability ?? 0.5,
      acousticness: p.acousticness ?? 0.3,
    });
  }

  function handleApply() {
    setMood(localMood);
    onApply();
  }

  return (
    <div className="space-y-5">
      {/* Presets grid */}
      <div>
        <p className="text-xs text-spotify-text uppercase tracking-wider mb-3 font-semibold">
          Mood Presets
        </p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(MOOD_PRESETS) as [MoodPreset, typeof MOOD_PRESETS[MoodPreset]][]).map(
            ([key, preset]) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePreset(key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-xs font-medium outline outline-2 outline-transparent ${
                  localMood.preset === key
                    ? "text-white"
                    : "bg-white/5 text-spotify-text hover:bg-white/10"
                }`}
                style={
                  localMood.preset === key
                    ? { backgroundColor: preset.color + "25", outlineColor: preset.color }
                    : {}
                }
                data-active={localMood.preset === key ? "true" : undefined}
              >
                <span className="text-xl">{preset.emoji}</span>
                <span className="leading-tight text-center">{preset.label}</span>
              </motion.button>
            )
          )}
        </div>
      </div>

      {/* Advanced sliders toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-spotify-text hover:text-white transition-colors"
      >
        <span className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}>▶</span>
        Manual Controls
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-1">
              <Slider
                label="Energy"
                value={localMood.energy}
                min={0} max={1} step={0.05}
                leftLabel="Calm"
                rightLabel="Intense"
                color="#FF6B35"
                onChange={(v) => setLocalMood({ ...localMood, preset: null, energy: v })}
              />
              <Slider
                label="Mood (Valence)"
                value={localMood.valence}
                min={0} max={1} step={0.05}
                leftLabel="Sad"
                rightLabel="Happy"
                color="#FFD93D"
                onChange={(v) => setLocalMood({ ...localMood, preset: null, valence: v })}
              />
              <Slider
                label="Danceability"
                value={localMood.danceability}
                min={0} max={1} step={0.05}
                leftLabel="Low"
                rightLabel="High"
                color="#FF3CAC"
                onChange={(v) => setLocalMood({ ...localMood, preset: null, danceability: v })}
              />
              <Slider
                label="Acousticness"
                value={localMood.acousticness}
                min={0} max={1} step={0.05}
                leftLabel="Electronic"
                rightLabel="Acoustic"
                color="#D4A574"
                onChange={(v) => setLocalMood({ ...localMood, preset: null, acousticness: v })}
              />
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-spotify-text">
                  <span>BPM Range</span>
                  <span>{localMood.bpmMin} – {localMood.bpmMax} BPM</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="50" max="200" step="5"
                    value={localMood.bpmMin}
                    onChange={(e) =>
                      setLocalMood({ ...localMood, preset: null, bpmMin: parseInt(e.target.value) })
                    }
                    className="flex-1 accent-spotify-green"
                  />
                  <input
                    type="range"
                    min="50" max="220" step="5"
                    value={localMood.bpmMax}
                    onChange={(e) =>
                      setLocalMood({ ...localMood, preset: null, bpmMax: parseInt(e.target.value) })
                    }
                    className="flex-1 accent-spotify-green"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleApply}
        className="w-full py-3 bg-spotify-green text-black font-bold rounded-full hover:bg-[#1ed760] transition-colors"
      >
        Apply & Refresh Queue
      </motion.button>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  leftLabel,
  rightLabel,
  color,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  leftLabel: string;
  rightLabel: string;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white font-medium">{label}</span>
        <span className="font-mono" style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-[10px] text-spotify-text/50">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
