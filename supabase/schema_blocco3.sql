-- ============================================================
-- Matchly — Blocco 3: Dashboard Gestore
-- Tabella managers + collegamento campi + RLS per i gestori.
-- Idempotente: sicuro da rilanciare.
-- ============================================================

-- Tabella manager (collega utente Supabase ai suoi campi)
CREATE TABLE IF NOT EXISTS managers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  stripe_account_id TEXT,            -- TODO(Stripe Connect): onboarding manuale al lancio
  stripe_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- In Blocco 2 sports_fields.manager_id referenziava auth.users.
-- Lo ripuntiamo a managers(id). Drop del vincolo vecchio se presente.
ALTER TABLE sports_fields DROP CONSTRAINT IF EXISTS sports_fields_manager_id_fkey;
ALTER TABLE sports_fields ADD CONSTRAINT sports_fields_manager_id_fkey
  FOREIGN KEY (manager_id) REFERENCES managers(id);

-- Permette a PostgREST di fare l'embed bookings → profiles (nome giocatore).
-- profiles.id e bookings.user_id puntano entrambi a auth.users.id, quindi
-- ogni user_id con onboarding completato ha una riga profiles corrispondente.
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_profiles_fkey;
ALTER TABLE bookings ADD CONSTRAINT bookings_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "manager vede se stesso" ON managers;
CREATE POLICY "manager vede se stesso" ON managers FOR SELECT USING (user_id = auth.uid());

-- Il manager gestisce (CRUD) solo i suoi campi.
DROP POLICY IF EXISTS "manager gestisce suoi campi" ON sports_fields;
CREATE POLICY "manager gestisce suoi campi" ON sports_fields
  FOR ALL
  USING (
    manager_id IN (SELECT id FROM managers WHERE user_id = auth.uid())
  )
  WITH CHECK (
    manager_id IN (SELECT id FROM managers WHERE user_id = auth.uid())
  );

-- Il manager vede le prenotazioni dei suoi campi.
DROP POLICY IF EXISTS "manager vede prenotazioni" ON bookings;
CREATE POLICY "manager vede prenotazioni" ON bookings
  FOR SELECT USING (
    field_id IN (
      SELECT id FROM sports_fields
      WHERE manager_id IN (SELECT id FROM managers WHERE user_id = auth.uid())
    )
  );

-- Il manager aggiorna lo status delle prenotazioni dei suoi campi.
DROP POLICY IF EXISTS "manager aggiorna prenotazioni" ON bookings;
CREATE POLICY "manager aggiorna prenotazioni" ON bookings
  FOR UPDATE USING (
    field_id IN (
      SELECT id FROM sports_fields
      WHERE manager_id IN (SELECT id FROM managers WHERE user_id = auth.uid())
    )
  );

-- Il manager gestisce gli slot dei suoi campi (blocchi, sconti, generazione).
DROP POLICY IF EXISTS "manager gestisce slot" ON field_slots;
CREATE POLICY "manager gestisce slot" ON field_slots
  FOR ALL
  USING (
    field_id IN (
      SELECT id FROM sports_fields
      WHERE manager_id IN (SELECT id FROM managers WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    field_id IN (
      SELECT id FROM sports_fields
      WHERE manager_id IN (SELECT id FROM managers WHERE user_id = auth.uid())
    )
  );
