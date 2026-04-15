-- ============================================================
-- Swapify — Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spotify_user_id TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  email           TEXT NOT NULL DEFAULT '',
  avatar_url      TEXT,
  privacy         TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own row
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Service role can do anything (for server-side code)
CREATE POLICY "service_all_users" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── swipe_events ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.swipe_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  track_id    TEXT NOT NULL,
  track_name  TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  genre       TEXT,
  direction   TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  mood_preset TEXT,
  swiped_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_swipe_events_user_id      ON public.swipe_events(user_id);
CREATE INDEX idx_swipe_events_direction    ON public.swipe_events(direction);
CREATE INDEX idx_swipe_events_swiped_at    ON public.swipe_events(swiped_at);
CREATE INDEX idx_swipe_events_track_id     ON public.swipe_events(track_id);

ALTER TABLE public.swipe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swipe_events_select_own" ON public.swipe_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "swipe_events_insert_own" ON public.swipe_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "service_all_swipe_events" ON public.swipe_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── sessions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end   TIMESTAMPTZ,
  total_swipes  INTEGER NOT NULL DEFAULT 0,
  rights_count  INTEGER NOT NULL DEFAULT 0,
  lefts_count   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_own" ON public.sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "service_all_sessions" ON public.sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── playlists ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.playlists (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  spotify_playlist_id  TEXT NOT NULL,
  playlist_name        TEXT NOT NULL DEFAULT '🎵 Discovered via Swipe',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_tracks_added   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id)
);

CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlists_select_own" ON public.playlists
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "service_all_playlists" ON public.playlists
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── tracks_seen ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tracks_seen (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  track_id    TEXT NOT NULL,
  seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, track_id)
);

CREATE INDEX idx_tracks_seen_user_id ON public.tracks_seen(user_id);
CREATE INDEX idx_tracks_seen_seen_at ON public.tracks_seen(seen_at);

ALTER TABLE public.tracks_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracks_seen_select_own" ON public.tracks_seen
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "service_all_tracks_seen" ON public.tracks_seen
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── friendships ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.friendships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX idx_friendships_status    ON public.friendships(status);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can see friendships they're part of
CREATE POLICY "friendships_select_own" ON public.friendships
  FOR SELECT USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );

CREATE POLICY "friendships_insert_requester" ON public.friendships
  FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Addressee can update (accept/block)
CREATE POLICY "friendships_update_addressee" ON public.friendships
  FOR UPDATE USING (addressee_id = auth.uid());

CREATE POLICY "service_all_friendships" ON public.friendships
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── mood_preferences ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mood_preferences (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  preset       TEXT,
  energy       REAL NOT NULL DEFAULT 0.65,
  valence      REAL NOT NULL DEFAULT 0.7,
  bpm_min      INTEGER NOT NULL DEFAULT 80,
  bpm_max      INTEGER NOT NULL DEFAULT 150,
  danceability REAL NOT NULL DEFAULT 0.7,
  acousticness REAL NOT NULL DEFAULT 0.2,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mood_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mood_prefs_select_own" ON public.mood_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "service_all_mood_prefs" ON public.mood_preferences
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── Helpful view: public right-swipes for the activity feed ──
CREATE OR REPLACE VIEW public.public_right_swipes AS
  SELECT
    se.id,
    se.user_id,
    se.track_id,
    se.track_name,
    se.artist_name,
    se.swiped_at,
    u.display_name,
    u.avatar_url
  FROM public.swipe_events se
  JOIN public.users u ON u.id = se.user_id
  WHERE se.direction = 'right'
    AND u.privacy IN ('public', 'friends');
