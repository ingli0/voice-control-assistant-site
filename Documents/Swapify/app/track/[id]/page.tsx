import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Track ${id} — Swapify`,
    description: "Discover this track on Swapify — the Tinder-style music discovery app.",
  };
}

export default async function TrackSharePage({ params }: Props) {
  const { id } = await params;
  const spotifyUrl = `https://open.spotify.com/track/${id}`;

  return (
    <main className="min-h-screen bg-spotify-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-3xl p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-spotify-green rounded-full flex items-center justify-center text-3xl">
          🎵
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Someone shared a track with you!</h1>
          <p className="text-spotify-text">
            Discover music through swipes on Swapify — the Tinder-style music discovery app.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-spotify-green text-black font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Listen on Spotify
          </a>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 border border-white/20 text-white font-semibold py-3 px-6 rounded-full hover:bg-white/10 transition-colors"
          >
            Try Swapify — Discover Music
          </Link>
        </div>

        <p className="text-xs text-spotify-text/60">
          Swapify — Swipe your way to new music
        </p>
      </div>
    </main>
  );
}
