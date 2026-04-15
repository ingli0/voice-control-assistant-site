"use client";
import { motion } from "framer-motion";
import { TIER_COLORS } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";

interface Props {
  achievement: Achievement & { unlocked: boolean };
  showNew?: boolean;
}

export default function AchievementBadge({ achievement, showNew }: Props) {
  const tier = TIER_COLORS[achievement.tier];
  const locked = !achievement.unlocked;

  return (
    <motion.div
      whileHover={!locked ? { scale: 1.04 } : {}}
      className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition-all ${
        locked ? "opacity-40 grayscale" : "glass"
      }`}
      style={
        !locked
          ? { boxShadow: `0 0 20px ${tier.glow}`, background: `${tier.bg}15` }
          : { background: "rgba(255,255,255,0.03)" }
      }
    >
      {showNew && !locked && (
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          NEW
        </motion.div>
      )}

      <div className="text-3xl">{achievement.emoji}</div>

      <div>
        <p
          className="text-xs font-black uppercase tracking-wide"
          style={{ color: locked ? "#666" : tier.bg }}
        >
          {achievement.tier}
        </p>
        <p className="text-sm font-bold text-white mt-0.5">{achievement.label}</p>
        <p className="text-[10px] text-spotify-text mt-0.5 leading-tight">
          {achievement.description}
        </p>
      </div>
    </motion.div>
  );
}
