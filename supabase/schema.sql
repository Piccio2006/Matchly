-- Profili utente (estende auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
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
CREATE TABLE player_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  velocita DECIMAL(3,1) DEFAULT 5.0,
  resistenza DECIMAL(3,1) DEFAULT 5.0,
  tecnica DECIMAL(3,1) DEFAULT 5.0,
  fisico DECIMAL(3,1) DEFAULT 5.0,
  senso_del_gol DECIMAL(3,1) DEFAULT 5.0,
  fairplay DECIMAL(3,1) DEFAULT 5.0,
  leadership DECIMAL(3,1) DEFAULT 5.0,
  carisma DECIMAL(3,1) DEFAULT 5.0,

  velocita_peer DECIMAL(3,1),
  resistenza_peer DECIMAL(3,1),
  tecnica_peer DECIMAL(3,1),
  fisico_peer DECIMAL(3,1),
  senso_del_gol_peer DECIMAL(3,1),
  fairplay_peer DECIMAL(3,1),
  leadership_peer DECIMAL(3,1),
  carisma_peer DECIMAL(3,1),

  matchly_score DECIMAL(3,1) DEFAULT 5.0,
  level TEXT DEFAULT 'bronze',

  total_matches INTEGER DEFAULT 0,
  attended_matches INTEGER DEFAULT 0,
  completed_feedbacks INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(player_id)
);

-- Waitlist matchmaking
CREATE TABLE matchmaking_waitlist (
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

CREATE POLICY "Profilo visibile a tutti gli autenticati"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utente può aggiornare il proprio profilo"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Utente può inserire il proprio profilo"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Stats visibili a tutti gli autenticati"
  ON player_stats FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utente può gestire le proprie stats"
  ON player_stats FOR ALL TO authenticated USING (auth.uid() = player_id);

CREATE POLICY "Chiunque può leggere il contatore waitlist"
  ON matchmaking_waitlist FOR SELECT USING (true);

CREATE POLICY "Chiunque può iscriversi alla waitlist"
  ON matchmaking_waitlist FOR INSERT WITH CHECK (true);

-- Trigger: aggiorna updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER player_stats_updated_at BEFORE UPDATE ON player_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
