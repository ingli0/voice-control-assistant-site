"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AchievementBadge from "./AchievementBadge";
import type { Achievement } from "@/lib/achievements";
import { TIER_COLORS } from "@/lib/achievements";

interface AchievementWithUnlock extends Achievement {
  unlocked: boolean;
}

export default function AchievementsPanel() {
  const [achievements, setAchievements] = useState<AchievementWithUnlock[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => {
        setAchievements(d.achievements ?? []);
        setStats(d.stats ?? {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked   = achievements.filter((a) => !a.unlocked);

  const tierOrder = ["platinum", "gold", "silver", "bronze"];
  const byTier = (list: AchievementWithUnlock[]) =>
    tierOrder.flatMap((t) => list.filter((a) => a.tier === t));

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      {!loading && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-white">
              {unlocked.length} / {achievements.length} Unlocked
            </p>
            <p className="text-xs text-spotify-green font-bold">
              {Math.round((unlocked.length / Math.max(achievements.length, 1)) * 100)}%
            </p>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-spotify-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(unlocked.length / Math.max(achievements.length, 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Tier breakdown */}
          <div className="flex gap-3">
            {(["platinum", "gold", "silver", "bronze"] as const).map((tier) => {
              const total = achievements.filter((a) => a.tier === tier).length;
              const got   = unlocked.filter((a) => a.tier === tier).length;
              return (
                <div key={tier} className="flex-1 text-center">
                  <p className="text-sm font-bold" style={{ color: TIER_COLORS[tier].bg }}>
                    {got}/{total}
                  </p>
                  <p className="text-[9px] text-spotify-text capitalize">{tier}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-28" />
          ))}
        </div>
      ) : (
        <>
          {unlocked.length > 0 && (
            <div>
              <p className="text-xs text-spotify-text uppercase tracking-wider font-semibold mb-3">
                Unlocked ✓
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {byTier(unlocked).map((a) => (
                  <AchievementBadge key={a.id} achievement={a} />
                ))}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div>
              <p className="text-xs text-spotify-text uppercase tracking-wider font-semibold mb-3">
                Locked 🔒
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {byTier(locked).map((a) => (
                  <AchievementBadge key={a.id} achievement={a} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
