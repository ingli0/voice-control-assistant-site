# Swapify — Tinder-Style Music Discovery

Discover music through swipes, powered by Spotify and Supabase.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (Postgres + RLS) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand |

## Features

- **Swipe UI** — Drag left to skip, right to save. Works on touch and mouse.
- **30-sec Previews** — Embedded audio player on every card.
- **Mood Discovery** — 8 presets (Energetic, Chill, Happy, Melancholic, Focus, Party, Hype, Acoustic) + manual audio feature sliders.
- **Album Art Colors** — Card background dynamically matches the album artwork.
- **Auto Playlist** — Saved tracks go straight into a dedicated "🎵 Discovered via Swipe" Spotify playlist.
- **Analytics Dashboard** — Personal + global swipe stats, genre breakdown, swipe trends, leaderboard.
- **Trending Page** — Most-saved tracks globally over the last 7 days with sparkline charts.
- **Social Feed** — See what friends are saving in real-time.
- **Friend System** — Search, request, accept/decline friends.
- **Share Links** — Every track gets a public `/track/[id]` shareable page.
- **Privacy Controls** — Public / Friends Only / Private toggle.

## Setup

### 1. Clone and install

```bash
git clone <this-repo>
cd swapify
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

| Variable | Where to get it |
|---|---|
| `SPOTIFY_CLIENT_ID` | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | Same dashboard |
| `SPOTIFY_REDIRECT_URI` | Set to `http://localhost:3000/api/auth/callback` in dev |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same settings page |
| `SUPABASE_SERVICE_ROLE_KEY` | Same settings page (secret key) |

### 3. Set up Supabase

Run the migration in your Supabase SQL editor:

```sql
-- Copy contents of supabase/migrations/001_init.sql
```

Or use the Supabase CLI:

```bash
npx supabase db push
```

### 4. Configure Spotify App

In your Spotify App settings:
- Add `http://localhost:3000/api/auth/callback` to **Redirect URIs**
- Enable "Web API" access

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with Spotify.

## Deployment

Deployable to Vercel with zero config:

```bash
npx vercel --prod
```

Set all env vars in the Vercel dashboard and update `SPOTIFY_REDIRECT_URI` to your production URL.

## Project Structure

```
app/
  api/
    auth/        → OAuth flow (spotify, callback, refresh, logout, me)
    tracks/      → Recommendation queue
    swipe/       → Record swipe + add to playlist
    dashboard/   → Analytics queries
    trending/    → Global trending tracks
    social/      → Feed, friends, search
    settings/    → Privacy controls
  login/         → Login page
  discover/      → Main swipe UI
  dashboard/     → Analytics
  social/        → Friends + activity feed
  trending/      → Trending tracks
  track/[id]/    → Shareable track page

components/
  SwipeCard      → Draggable track card with color extraction
  AudioPlayer    → 30s preview with waveform animation
  MoodSelector   → Preset + manual audio feature controls
  DashboardClient → Recharts analytics
  TrendingClient  → Ranked trending list with sparklines
  SocialClient    → Feed + friend management
  NavBar          → Top (desktop) + bottom (mobile) navigation

lib/
  types.ts        → All TypeScript interfaces + mood presets
  spotify.ts      → Spotify API wrapper
  supabase.ts     → Supabase clients
  store.ts        → Zustand global state
  colors.ts       → Canvas-based color extraction

supabase/
  migrations/001_init.sql  → Full schema with RLS policies
```
