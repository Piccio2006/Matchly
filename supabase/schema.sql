-- Profili utente (estende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  city TEXT,
  preferred_sports TEXT[] DEFAULT '{}',
  preferred_role TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Statistiche giocatore
CREATE TABLE IF NOT EXISTS player_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  velocita DECIMAL(3,1) DEFAULT 5.0 CHECK (velocita BETWEEN 1.0 AND 10.0),
  resistenza DECIMAL(3,1) DEFAULT 5.0 CHECK (resistenza BETWEEN 1.0 AND 10.0),
  tecnica DECIMAL(3,1) DEFAULT 5.0 CHECK (tecnica BETWEEN 1.0 AND 10.0),
  fisico DECIMAL(3,1) DEFAULT 5.0 CHECK (fisico BETWEEN 1.0 AND 10.0),
  senso_del_gol DECIMAL(3,1) DEFAULT 5.0 CHECK (senso_del_gol BETWEEN 1.0 AND 10.0),
  fairplay DECIMAL(3,1) DEFAULT 5.0 CHECK (fairplay BETWEEN 1.0 AND 10.0),
  leadership DECIMAL(3,1) DEFAULT 5.0 CHECK (leadership BETWEEN 1.0 AND 10.0),
  carisma DECIMAL(3,1) DEFAULT 5.0 CHECK (carisma BETWEEN 1.0 AND 10.0),

  velocita_peer DECIMAL(3,1) CHECK (velocita_peer BETWEEN 1.0 AND 10.0),
  resistenza_peer DECIMAL(3,1) CHECK (resistenza_peer BETWEEN 1.0 AND 10.0),
  tecnica_peer DECIMAL(3,1) CHECK (tecnica_peer BETWEEN 1.0 AND 10.0),
  fisico_peer DECIMAL(3,1) CHECK (fisico_peer BETWEEN 1.0 AND 10.0),
  senso_del_gol_peer DECIMAL(3,1) CHECK (senso_del_gol_peer BETWEEN 1.0 AND 10.0),
  fairplay_peer DECIMAL(3,1) CHECK (fairplay_peer BETWEEN 1.0 AND 10.0),
  leadership_peer DECIMAL(3,1) CHECK (leadership_peer BETWEEN 1.0 AND 10.0),
  carisma_peer DECIMAL(3,1) CHECK (carisma_peer BETWEEN 1.0 AND 10.0),

  matchly_score DECIMAL(3,1) DEFAULT 5.0 CHECK (matchly_score BETWEEN 1.0 AND 10.0),
  level TEXT DEFAULT 'bronze' CHECK (level IN ('bronze', 'silver', 'gold', 'platinum', 'elite')),

  total_matches INTEGER DEFAULT 0,
  attended_matches INTEGER DEFAULT 0,
  completed_feedbacks INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(player_id)
);

-- Waitlist matchmaking
CREATE TABLE IF NOT EXISTS matchmaking_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  player_id UUID REFERENCES profiles(id),
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profilo visibile a tutti gli autenticati" ON profiles;
CREATE POLICY "Profilo visibile a tutti gli autenticati"
  ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Utente può aggiornare il proprio profilo" ON profiles;
CREATE POLICY "Utente può aggiornare il proprio profilo"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Utente può inserire il proprio profilo" ON profiles;
CREATE POLICY "Utente può inserire il proprio profilo"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Stats visibili a tutti gli autenticati" ON player_stats;
CREATE POLICY "Stats visibili a tutti gli autenticati"
  ON player_stats FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Utente può inserire le proprie stats" ON player_stats;
CREATE POLICY "Utente può inserire le proprie stats"
  ON player_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Utente può aggiornare le proprie stats" ON player_stats;
CREATE POLICY "Utente può aggiornare le proprie stats"
  ON player_stats FOR UPDATE TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Utente può eliminare le proprie stats" ON player_stats;
CREATE POLICY "Utente può eliminare le proprie stats"
  ON player_stats FOR DELETE TO authenticated USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Chiunque può leggere il contatore waitlist" ON matchmaking_waitlist;
CREATE POLICY "Chiunque può leggere il contatore waitlist"
  ON matchmaking_waitlist FOR SELECT USING (true);

DROP POLICY IF EXISTS "Chiunque può iscriversi alla waitlist" ON matchmaking_waitlist;
CREATE POLICY "Chiunque può iscriversi alla waitlist"
  ON matchmaking_waitlist FOR INSERT
  WITH CHECK (player_id IS NULL OR auth.uid() = player_id);

-- Trigger: aggiorna updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS player_stats_updated_at ON player_stats;
CREATE TRIGGER player_stats_updated_at BEFORE UPDATE ON player_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
