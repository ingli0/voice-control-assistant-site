"use client";
import { motion } from "framer-motion";

export default function CardSkeleton() {
  return (
    <div className="w-full h-full rounded-3xl bg-spotify-card overflow-hidden relative">
      {/* Album art placeholder */}
      <div className="absolute inset-0 flex flex-col p-5 gap-4">
        <div className="flex gap-2">
          <div className="skeleton w-16 h-5 rounded-full" />
          <div className="skeleton w-12 h-5 rounded-full" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="skeleton w-48 h-48 rounded-2xl" />
        </div>

        <div className="space-y-3">
          <div className="skeleton h-7 w-3/4 rounded-lg" />
          <div className="skeleton h-4 w-1/2 rounded-lg" />
          <div className="flex gap-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-12 rounded-full" />
            <div className="skeleton h-5 w-14 rounded-full" />
          </div>
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>

      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
