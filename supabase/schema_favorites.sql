-- ============================================================
-- Matchly — Campi preferiti (B2)
-- ============================================================

CREATE TABLE IF NOT EXISTS field_favorites (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  field_id   UUID REFERENCES sports_fields(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, field_id)
);

ALTER TABLE field_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user vede preferiti" ON field_favorites;
CREATE POLICY "user vede preferiti" ON field_favorites
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user gestisce preferiti" ON field_favorites;
CREATE POLICY "user gestisce preferiti" ON field_favorites
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
