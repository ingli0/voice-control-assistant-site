"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAppStore } from "@/lib/store";

const NAV = [
  { href: "/discover", label: "Discover", icon: "🎵" },
  { href: "/trending", label: "Trending", icon: "🔥" },
  { href: "/social", label: "Social", icon: "👥" },
  { href: "/dashboard", label: "Stats", icon: "📊" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { displayName, avatarUrl, reset } = useAppStore();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    reset();
    router.push("/login");
  }

  return (
    <>
      {/* Top bar — desktop */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass-dark h-16 items-center px-6 justify-between">
        <Link href="/discover" className="flex items-center gap-2">
          <span className="text-xl">🎵</span>
          <span className="text-xl font-black text-white">
            Swap<span className="gradient-text">ify</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                pathname === n.href
                  ? "bg-spotify-green/20 text-spotify-green"
                  : "text-spotify-text hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName ?? "User"}
              width={32}
              height={32}
              className="rounded-full ring-2 ring-spotify-green/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-spotify-card flex items-center justify-center text-sm">
              {displayName?.[0] ?? "?"}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-spotify-text hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around py-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                pathname === n.href ? "text-spotify-green" : "text-spotify-text"
              }`}
            >
              <span className="text-xl">{n.icon}</span>
              <span className="text-[10px] font-medium">{n.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-spotify-text"
          >
            <span className="text-xl">👤</span>
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
