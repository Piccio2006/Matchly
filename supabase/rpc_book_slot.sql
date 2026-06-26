-- ============================================================
-- Matchly — RPC: book_slot
-- A4: Risolve la race condition nella prenotazione usando un lock
-- atomico su field_slots + inserimento booking in un'unica transazione.
-- ============================================================

CREATE OR REPLACE FUNCTION book_slot(
  p_field_id      UUID,
  p_slot_id       UUID,
  p_user_id       UUID,
  p_sport         TEXT,
  p_date          DATE,
  p_start_time    TIME,
  p_end_time      TIME,
  p_price_paid    NUMERIC,
  p_commission    NUMERIC,
  p_discount      NUMERIC,
  p_payment_id    TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'card'
)
RETURNS TABLE(booking_id UUID, booking_code TEXT, error_code TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_available     BOOLEAN;
  v_booking_id    UUID;
  v_code          TEXT;
BEGIN
  -- Lock the slot row to prevent concurrent bookings
  SELECT is_available INTO v_available
  FROM field_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 'slot_not_found'::TEXT;
    RETURN;
  END IF;

  IF NOT v_available THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 'slot_taken'::TEXT;
    RETURN;
  END IF;

  -- Mark slot as unavailable
  UPDATE field_slots SET is_available = FALSE WHERE id = p_slot_id;

  -- Generate booking code (8 uppercase alphanumeric chars)
  v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));

  -- Insert booking
  INSERT INTO bookings (
    booking_code, field_id, user_id, slot_id, sport,
    date, start_time, end_time,
    price_paid, commission_amount, discount_applied,
    status, payment_intent_id, payment_method
  )
  VALUES (
    v_code, p_field_id, p_user_id, p_slot_id, p_sport,
    p_date, p_start_time, p_end_time,
    p_price_paid, p_commission, p_discount,
    'confirmed', p_payment_id, p_payment_method
  )
  RETURNING id INTO v_booking_id;

  RETURN QUERY SELECT v_booking_id, v_code, NULL::TEXT;
END;
$$;

-- Grant to authenticated users
GRANT EXECUTE ON FUNCTION book_slot TO authenticated;
