"use client";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: "🎵", label: "Personalized recommendations" },
  { icon: "💚", label: "Swipe right to save tracks" },
  { icon: "📊", label: "Your music analytics" },
  { icon: "👥", label: "See what friends are saving" },
  { icon: "🔥", label: "Global trending tracks" },
  { icon: "🎭", label: "Mood-based discovery" },
];

export default function LoginClient({ error }: { error?: string }) {
  const errorMessages: Record<string, string> = {
    access_denied: "Spotify access was denied. Please try again.",
    invalid_state: "Security validation failed. Please try again.",
    server_error: "Something went wrong on our end. Please try again.",
  };

  return (
    <main className="min-h-screen bg-spotify-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-spotify-green/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 max-w-sm w-full space-y-8">
        {/* Logo */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              className="w-16 h-16 bg-spotify-green rounded-2xl flex items-center justify-center text-4xl shadow-lg"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              🎵
            </motion.div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Swap<span className="gradient-text">ify</span>
          </h1>
          <p className="text-spotify-text mt-2 text-base">
            Discover music through swipes
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {errorMessages[error] ?? "An error occurred. Please try again."}
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          className="glass rounded-2xl p-5 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              className="flex items-center gap-3 text-sm text-spotify-text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
            >
              <span className="text-lg">{f.icon}</span>
              <span>{f.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Login button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <a
            href="/api/auth/spotify"
            className="w-full flex items-center justify-center gap-3 bg-spotify-green text-black font-bold text-base py-4 px-6 rounded-full hover:bg-[#1ed760] transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg glow-green"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Continue with Spotify
          </a>
        </motion.div>

        <p className="text-center text-xs text-spotify-text/50">
          By continuing, you agree to our Terms of Service.
          <br />
          We only request the permissions we need.
        </p>
      </div>
    </main>
  );
}
