-- ============================================================
-- Matchly — Blocco 3: Trigger & Realtime
-- E1: Aggiornamento automatico rating_avg / rating_count su sports_fields
-- E2: Aggiornamento matchly_score su player_stats dopo ogni partita completata
-- E4: Abilitazione Realtime su field_slots
-- ============================================================

-- ─── E1: rating trigger ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_field_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_avg   NUMERIC;
  v_count INT;
BEGIN
  SELECT
    ROUND(AVG((rating_surface + rating_facilities + rating_structure + rating_value) / 4.0)::NUMERIC, 2),
    COUNT(*)
  INTO v_avg, v_count
  FROM field_reviews
  WHERE field_id = NEW.field_id;

  UPDATE sports_fields
  SET rating_avg   = COALESCE(v_avg, 0),
      rating_count = v_count
  WHERE id = NEW.field_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_field_rating ON field_reviews;
CREATE TRIGGER trg_update_field_rating
  AFTER INSERT OR UPDATE OR DELETE ON field_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_field_rating();

-- ─── E2: matchly_score trigger ───────────────────────────────
-- Ricalcola matchly_score come media pesata dei 4 core stats
-- più un bonus per partite giocate e fairplay.

CREATE OR REPLACE FUNCTION update_matchly_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_stats       player_stats%ROWTYPE;
  v_core_avg    NUMERIC;
  v_attendance  NUMERIC;
  v_bonus       NUMERIC;
  v_score       NUMERIC;
BEGIN
  -- Carica stats aggiornate
  SELECT * INTO v_stats FROM player_stats WHERE player_id = NEW.user_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Media dei 4 core stats (tecnica, velocita, fisico, resistenza) — scala 0-10
  v_core_avg := (v_stats.tecnica + v_stats.velocita + v_stats.fisico + v_stats.resistenza) / 4.0;

  -- Bonus presenze (max +1 per 100% attendance, proporzionale)
  v_attendance := CASE WHEN v_stats.total_matches > 0
    THEN (v_stats.attended_matches::NUMERIC / v_stats.total_matches)
    ELSE 0 END;

  -- Bonus fairplay (normalizzato su 10, peso 0.5)
  v_bonus := (v_stats.fairplay / 10.0) * 0.5 + v_attendance * 0.5;

  -- Score finale: media core (peso 0.8) + bonus (peso 0.2), scala 0-10
  v_score := ROUND((v_core_avg * 0.8 + v_bonus * 2.0 * 0.2) * 10) / 10.0;
  v_score := GREATEST(0, LEAST(10, v_score));

  UPDATE player_stats
  SET matchly_score = v_score
  WHERE player_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_matchly_score ON bookings;
CREATE TRIGGER trg_matchly_score
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed')
  EXECUTE FUNCTION update_matchly_score();

-- ─── E4: Realtime per field_slots ────────────────────────────
-- Abilita publication realtimesu field_slots per sincronizzazione
-- live della disponibilità tra utenti.

ALTER PUBLICATION supabase_realtime ADD TABLE field_slots;
