-- ============================================================
-- Matchly — Blocco 3: collega un utente esistente come GESTORE
-- e assegnagli un campo. Esegui DOPO schema_blocco3.sql.
--
-- PREREQUISITO: l'utente deve già esistere in Supabase Auth.
-- Crealo da Dashboard → Authentication → Add user (email + password),
-- oppure registralo dall'app mobile, POI esegui questo script.
--
-- Sostituisci l'email qui sotto con quella del gestore reale.
-- ============================================================

DO $$
DECLARE
  v_email TEXT := 'gestore@matchly.test';  -- <-- CAMBIA con l'email del gestore
  v_user_id UUID;
  v_manager_id UUID;
  v_field_id UUID;
BEGIN
  -- 1. Trova l'utente auth
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utente % non trovato in auth.users. Crealo prima da Authentication.', v_email;
  END IF;

  -- 2. Crea (o recupera) il manager
  INSERT INTO managers (user_id, name, business_name)
  VALUES (v_user_id, 'Gestore Demo', 'Centro Sportivo Isolotto')
  ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_manager_id;

  -- 3. Assegna il primo campo demo di Firenze a questo manager
  SELECT id INTO v_field_id FROM sports_fields
    WHERE city = 'Firenze' AND name = 'Centro Sportivo Isolotto'
    LIMIT 1;

  IF v_field_id IS NOT NULL THEN
    UPDATE sports_fields SET manager_id = v_manager_id WHERE id = v_field_id;
  END IF;

  RAISE NOTICE 'Manager % collegato al campo %', v_manager_id, v_field_id;
END $$;
