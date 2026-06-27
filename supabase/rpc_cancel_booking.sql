-- ============================================================
-- Matchly — RPC: cancel_booking
-- Annulla una prenotazione e rilibera atomicamente lo slot
-- (is_available = TRUE) in un'unica transazione, così lo slot
-- torna prenotabile da altri utenti. Applica il controllo proprietà:
-- un utente può annullare solo le proprie prenotazioni 'confirmed'.
-- ============================================================

CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID,
  p_user_id    UUID
)
RETURNS TABLE(ok BOOLEAN, error_code TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_slot_id   UUID;
  v_status    TEXT;
  v_owner     UUID;
BEGIN
  -- Lock the booking row
  SELECT slot_id, status, user_id
    INTO v_slot_id, v_status, v_owner
  FROM bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'booking_not_found'::TEXT;
    RETURN;
  END IF;

  IF v_owner <> p_user_id THEN
    RETURN QUERY SELECT FALSE, 'not_owner'::TEXT;
    RETURN;
  END IF;

  IF v_status <> 'confirmed' THEN
    RETURN QUERY SELECT FALSE, 'not_cancellable'::TEXT;
    RETURN;
  END IF;

  -- Cancel the booking
  UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;

  -- Free the slot so it can be booked again
  IF v_slot_id IS NOT NULL THEN
    UPDATE field_slots SET is_available = TRUE WHERE id = v_slot_id;
  END IF;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_booking TO authenticated;
