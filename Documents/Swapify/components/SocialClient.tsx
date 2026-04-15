"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import NavBar from "./NavBar";

interface FriendItem {
  id: string;
  status: "pending" | "accepted" | "blocked";
  isRequester: boolean;
  user: { id: string; display_name: string; avatar_url: string | null };
  created_at: string;
}

interface FeedItem {
  id: string;
  user: { id: string; display_name: string; avatar_url: string | null };
  track_id: string;
  track_name: string;
  artist_name: string;
  swiped_at: string;
}

type Tab = "feed" | "friends";

export default function SocialClient() {
  const [tab, setTab] = useState<Tab>("feed");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [friendships, setFriendships] = useState<FriendItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; display_name: string; avatar_url: string | null }[]>([]);
  const [searching, setSearching] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/social/feed")
      .then((r) => r.json())
      .then((d) => { setFeed(d.feed ?? []); setFeedLoading(false); })
      .catch(() => setFeedLoading(false));

    fetch("/api/social/friends")
      .then((r) => r.json())
      .then((d) => { setFriendships(d.friendships ?? []); setFriendsLoading(false); })
      .catch(() => setFriendsLoading(false));
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const r = await fetch(`/api/social/search?q=${encodeURIComponent(q)}`);
    const d = await r.json();
    setSearchResults(d.users ?? []);
    setSearching(false);
  }, []);

  async function sendRequest(addressee_id: string) {
    await fetch("/api/social/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressee_id }),
    });
    setSearchResults([]);
    setSearchQuery("");
    // Refresh friendships
    const r = await fetch("/api/social/friends");
    const d = await r.json();
    setFriendships(d.friendships ?? []);
  }

  async function respondRequest(friendship_id: string, status: "accepted" | "blocked") {
    await fetch("/api/social/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendship_id, status }),
    });
    setFriendships((prev) =>
      prev.map((f) => (f.id === friendship_id ? { ...f, status } : f))
    );
  }

  const accepted = friendships.filter((f) => f.status === "accepted");
  const pending = friendships.filter((f) => f.status === "pending" && !f.isRequester);
  const sent = friendships.filter((f) => f.status === "pending" && f.isRequester);

  return (
    <div className="min-h-screen bg-spotify-dark">
      <NavBar />
      <main className="pt-4 md:pt-20 pb-24 px-4 max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-black text-white">Social</h1>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-full p-1 w-fit">
          {(["feed", "friends"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                tab === t ? "bg-spotify-green text-black" : "text-spotify-text hover:text-white"
              }`}
            >
              {t === "feed" ? "🎵 Feed" : `👥 Friends ${accepted.length > 0 ? `(${accepted.length})` : ""}`}
              {t === "friends" && pending.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "feed" ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {feedLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-2xl h-16" />
                ))
              ) : feed.length === 0 ? (
                <div className="text-center py-16 text-spotify-text space-y-2">
                  <p className="text-3xl">👋</p>
                  <p className="font-semibold text-white">Your feed is empty</p>
                  <p className="text-sm">Add friends to see what they're saving!</p>
                </div>
              ) : (
                feed.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass rounded-2xl p-4 flex items-center gap-3"
                  >
                    {item.user.avatar_url ? (
                      <Image
                        src={item.user.avatar_url}
                        alt={item.user.display_name}
                        width={36}
                        height={36}
                        className="rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-spotify-card flex items-center justify-center text-sm flex-shrink-0">
                        {item.user.display_name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-semibold">{item.user.display_name}</span>
                        {" "}
                        <span className="text-spotify-green">saved</span>
                      </p>
                      <p className="text-xs text-spotify-text truncate">
                        {item.track_name} — {item.artist_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`https://open.spotify.com/track/${item.track_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-spotify-green text-xs hover:underline"
                      >
                        ▶
                      </a>
                      <p className="text-[10px] text-spotify-text/50">
                        {relativeTime(item.swiped_at)}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="friends"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search users by display name..."
                  className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-1 focus:ring-spotify-green/50"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-text animate-spin">
                    ⟳
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl overflow-hidden z-10">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => sendRequest(u.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                      >
                        {u.avatar_url ? (
                          <Image src={u.avatar_url} alt={u.display_name} width={28} height={28} className="rounded-full" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-spotify-card flex items-center justify-center text-xs">
                            {u.display_name[0]}
                          </div>
                        )}
                        <span className="text-sm text-white">{u.display_name}</span>
                        <span className="ml-auto text-xs text-spotify-green">+ Add</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending requests */}
              {pending.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-spotify-text uppercase tracking-wider font-semibold">
                    Friend Requests ({pending.length})
                  </p>
                  {pending.map((f) => (
                    <div key={f.id} className="glass rounded-xl p-3 flex items-center gap-3">
                      <UserAvatar user={f.user} />
                      <p className="flex-1 text-sm text-white">{f.user.display_name}</p>
                      <button
                        onClick={() => respondRequest(f.id, "accepted")}
                        className="text-xs bg-spotify-green text-black font-bold px-3 py-1.5 rounded-full"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondRequest(f.id, "blocked")}
                        className="text-xs border border-white/20 text-spotify-text px-3 py-1.5 rounded-full hover:bg-white/10"
                      >
                        Decline
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Accepted friends */}
              {accepted.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-spotify-text uppercase tracking-wider font-semibold">
                    Friends ({accepted.length})
                  </p>
                  {accepted.map((f) => (
                    <div key={f.id} className="glass rounded-xl p-3 flex items-center gap-3">
                      <UserAvatar user={f.user} />
                      <p className="flex-1 text-sm text-white">{f.user.display_name}</p>
                      <span className="text-xs text-spotify-green">✓ Friends</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sent requests */}
              {sent.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-spotify-text uppercase tracking-wider font-semibold">
                    Sent Requests
                  </p>
                  {sent.map((f) => (
                    <div key={f.id} className="glass rounded-xl p-3 flex items-center gap-3 opacity-60">
                      <UserAvatar user={f.user} />
                      <p className="flex-1 text-sm text-white">{f.user.display_name}</p>
                      <span className="text-xs text-spotify-text">Pending...</span>
                    </div>
                  ))}
                </div>
              )}

              {friendsLoading && (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-xl h-14" />
                ))
              )}

              {!friendsLoading && friendships.length === 0 && (
                <div className="text-center py-12 text-spotify-text space-y-2">
                  <p className="text-3xl">🤝</p>
                  <p className="font-semibold text-white">No friends yet</p>
                  <p className="text-sm">Search for users above to add them!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function UserAvatar({ user }: { user: { display_name: string; avatar_url: string | null } }) {
  return user.avatar_url ? (
    <Image src={user.avatar_url} alt={user.display_name} width={32} height={32} className="rounded-full flex-shrink-0" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-spotify-card flex items-center justify-center text-xs flex-shrink-0">
      {user.display_name[0]}
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
