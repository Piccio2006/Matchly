-- ============================================================
-- Matchly — Blocco 2: Sistema Booking
-- Tabelle: sports_fields, field_slots, bookings, field_reviews
-- Idempotente: sicuro da rilanciare.
-- ============================================================

-- Strutture sportive
CREATE TABLE IF NOT EXISTS sports_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  sport_types TEXT[] NOT NULL,
  price_per_slot NUMERIC(10,2) NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 60,
  photos TEXT[] DEFAULT '{}',
  description TEXT,
  surface_type TEXT,
  amenities TEXT[] DEFAULT '{}',
  max_players INT NOT NULL DEFAULT 10,
  rating_avg NUMERIC(3,1) DEFAULT 0,
  rating_count INT DEFAULT 0,
  manager_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disponibilità slot per ogni campo
CREATE TABLE IF NOT EXISTS field_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_id UUID REFERENCES sports_fields(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  price_override NUMERIC(10,2),
  discount_percent INT DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 50),
  discount_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(field_id, date, start_time)
);

-- Prenotazioni
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT UNIQUE NOT NULL,
  field_id UUID REFERENCES sports_fields(id),
  user_id UUID REFERENCES auth.users(id),
  slot_id UUID REFERENCES field_slots(id),
  sport TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price_paid NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  discount_applied INT DEFAULT 0,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  payment_intent_id TEXT,
  payment_method TEXT,
  cancelled_at TIMESTAMPTZ,
  refund_amount NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recensioni campi (post-partita)
CREATE TABLE IF NOT EXISTS field_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  field_id UUID REFERENCES sports_fields(id),
  user_id UUID REFERENCES auth.users(id),
  rating_surface INT CHECK (rating_surface BETWEEN 1 AND 5),
  rating_facilities INT CHECK (rating_facilities BETWEEN 1 AND 5),
  rating_structure INT CHECK (rating_structure BETWEEN 1 AND 5),
  rating_value INT CHECK (rating_value BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Indici utili per le query di discovery
CREATE INDEX IF NOT EXISTS idx_sports_fields_city ON sports_fields(city) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_field_slots_field_date ON field_slots(field_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id, date DESC);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE sports_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campi pubblici" ON sports_fields;
CREATE POLICY "campi pubblici" ON sports_fields FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "slot pubblici" ON field_slots;
CREATE POLICY "slot pubblici" ON field_slots FOR SELECT USING (TRUE);

-- Consente al checkout di marcare lo slot come occupato.
-- Nota: in produzione spostare questa transizione in una RPC/Edge Function
-- con SECURITY DEFINER per evitare update arbitrari sugli slot.
DROP POLICY IF EXISTS "slot update booking" ON field_slots;
CREATE POLICY "slot update booking" ON field_slots FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "booking proprio" ON bookings;
CREATE POLICY "booking proprio" ON bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "booking insert" ON bookings;
CREATE POLICY "booking insert" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "booking update proprio" ON bookings;
CREATE POLICY "booking update proprio" ON bookings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "recensioni pubbliche" ON field_reviews;
CREATE POLICY "recensioni pubbliche" ON field_reviews FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "recensioni insert" ON field_reviews;
CREATE POLICY "recensioni insert" ON field_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
