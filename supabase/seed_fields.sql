-- ============================================================
-- Matchly — Blocco 2: Seed campi di test (Firenze)
-- Esegui DOPO schema_blocco2.sql.
-- Idempotente: pulisce slot/campi seed prima di reinserirli.
-- ============================================================

-- Pulizia dei dati seed precedenti (solo campi senza manager = dati demo)
DELETE FROM field_slots
  WHERE field_id IN (SELECT id FROM sports_fields WHERE manager_id IS NULL AND city = 'Firenze');
DELETE FROM sports_fields WHERE manager_id IS NULL AND city = 'Firenze';

-- ----- 4 campi realistici a Firenze -----
INSERT INTO sports_fields (name, address, city, sport_types, price_per_slot, slot_duration_minutes, surface_type, amenities, max_players, rating_avg, rating_count, latitude, longitude) VALUES
(
  'Centro Sportivo Isolotto',
  'Via Pisana 42, Firenze',
  'Firenze',
  ARRAY['calcetto', 'calciotto'],
  28.00, 60,
  'Erba sintetica 4G',
  ARRAY['spogliatoi', 'docce', 'parcheggio', 'bar'],
  10, 4.3, 28, 43.7696, 11.2065
),
(
  'Padel & Sport Novoli',
  'Via delle Panche 78, Firenze',
  'Firenze',
  ARRAY['padel', 'tennis'],
  24.00, 90,
  'Manto sintetico indoor',
  ARRAY['spogliatoi', 'docce', 'noleggio racchette'],
  4, 4.7, 52, 43.7923, 11.2189
),
(
  'Calcetto Cascine',
  'Viale degli Olmi 10, Firenze',
  'Firenze',
  ARRAY['calcetto'],
  22.00, 60,
  'Parquet',
  ARRAY['spogliatoi', 'bar'],
  10, 4.1, 15, 43.7789, 11.2102
),
(
  'Arena Sportiva Campo di Marte',
  'Via Mannelli 14, Firenze',
  'Firenze',
  ARRAY['calcetto', 'calciotto', 'padel'],
  32.00, 60,
  'Erba sintetica 3G',
  ARRAY['spogliatoi', 'docce', 'parcheggio', 'bar', 'illuminazione LED'],
  10, 4.6, 87, 43.7812, 11.2701
);

-- ----- Genera slot per i prossimi 7 giorni -----
-- Orari: 09,10,11 (mattina, scontati 30%), 14..21 (pomeriggio/sera).
-- ~15% degli slot marcati come occupati per simulare prenotazioni esistenti.
DO $$
DECLARE
  f RECORD;
  d INT;
  slot_hour INT;
  hours INT[] := ARRAY[9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21];
  the_date DATE;
  is_morning BOOLEAN;
  taken BOOLEAN;
BEGIN
  FOR f IN SELECT id, slot_duration_minutes FROM sports_fields WHERE manager_id IS NULL AND city = 'Firenze' LOOP
    FOR d IN 0..6 LOOP
      the_date := CURRENT_DATE + d;
      FOREACH slot_hour IN ARRAY hours LOOP
        is_morning := slot_hour < 12;
        -- ~15% occupati (deterministico-ish via random)
        taken := random() < 0.15;
        INSERT INTO field_slots (field_id, date, start_time, end_time, is_available, discount_percent, discount_expires_at)
        VALUES (
          f.id,
          the_date,
          make_time(slot_hour, 0, 0),
          make_time(slot_hour, 0, 0) + (f.slot_duration_minutes || ' minutes')::interval,
          NOT taken,
          CASE WHEN is_morning THEN 30 ELSE 0 END,
          CASE WHEN is_morning THEN (the_date + time '12:00')::timestamptz ELSE NULL END
        )
        ON CONFLICT (field_id, date, start_time) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
