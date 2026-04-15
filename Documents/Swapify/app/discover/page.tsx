import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DiscoverClient from "@/components/DiscoverClient";

export default async function DiscoverPage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("spotify_tokens");
  if (!tokenCookie) redirect("/login");

  let initialData: {
    userId: string;
    spotifyUserId: string;
    displayName: string;
    avatarUrl: string | null;
    playlistId: string | null;
    sessionId: string | null;
    moodPreset: string | null;
  } | null = null;

  try {
    const tokens = JSON.parse(tokenCookie.value);
    initialData = {
      userId: tokens.user_id,
      spotifyUserId: tokens.spotify_user_id,
      displayName: tokens.display_name,
      avatarUrl: tokens.avatar_url,
      playlistId: tokens.playlist_id,
      sessionId: tokens.session_id,
      moodPreset: null,
    };
  } catch {
    redirect("/login");
  }

  return <DiscoverClient initialData={initialData} />;
}
