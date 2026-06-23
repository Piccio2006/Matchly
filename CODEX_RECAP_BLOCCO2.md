# Blocco 2 — Sistema Booking (stato avanzamento)

Ultimo aggiornamento: 2026-06-23 (Claude)

## ✅ Completato e verificato

- **Schema:** `supabase/schema_blocco2.sql` — tabelle `sports_fields`, `field_slots`, `bookings`, `field_reviews` con RLS, indici, idempotente (DROP POLICY IF EXISTS, CREATE TABLE IF NOT EXISTS, CHECK constraints).
- **Seed:** `supabase/seed_fields.sql` — 4 campi Firenze + generazione slot 7 giorni via PL/pgSQL (orari 09–21, sconto 30% mattina, ~15% slot occupati). Idempotente (pulisce i dati seed prima).
- **Types:** `types/index.ts` — `SportField`, `FieldSlot`, `Booking`, `FieldReview`, `BookingStatus`, alias `SportType`.
- **i18n:** sezione `booking` completata in `locales/it.json` e `en.json`.
- **Helper logica:** `lib/booking.ts` — `computeSlotPrice`, `computeCommission` (10%), `generateBookingCode` ("M-XXXXXX"), `mockPayment` (delay 1.5s, TODO Stripe), `sportEmoji`, `approxDistanceKm`, `formatTime`, `FIRENZE_CENTER`.
- **Componenti:** `components/features/booking/FieldCard.tsx`, `BookingItem.tsx`.
- **Schermate:**
  - `app/(tabs)/booking.tsx` — discovery: search, chip sport, chip prezzo max, skeleton, badge Offerta, sort per rating+distanza, pull-to-refresh.
  - `app/field/[id].tsx` — dettaglio: hero/placeholder, info+amenities, date strip 7gg, slot disponibili/occupati/scontati, recensione placeholder.
  - `app/booking/checkout.tsx` — riepilogo, calcolo prezzo/sconto/commissione, mock payment, re-check slot (race), insert booking, marca slot occupato, naviga a conferma.
  - `app/booking/confirmation.tsx` — checkmark spring, codice cifra-per-cifra (stagger 80ms), QR placeholder, share (Share API RN), add-calendar placeholder, torna home.
  - `app/bookings/index.tsx` — lista completa prenotazioni.
- **Profilo:** `app/(tabs)/profile.tsx` — "Le mie prenotazioni" carica le ultime 3 reali via `useFocusEffect` + "Vedi tutte".
- **Routing:** `app/_layout.tsx` — convertito da `<Slot/>` a `<Stack/>` con le nuove route registrate.

**Verifiche eseguite:**
- `npx tsc --noEmit` → 0 errori
- `npx expo export -p web` → build OK

## ⚠️ Da fare in Supabase (manuale, non automatizzabile da qui)

1. SQL Editor → esegui `supabase/schema_blocco2.sql`
2. SQL Editor → esegui `supabase/seed_fields.sql`
3. Verifica che `sports_fields` abbia 4 righe e `field_slots` ~308 righe (4 campi × 7 giorni × 11 slot).

Senza questo passaggio le schermate booking mostrano "Nessun campo trovato".

## 🔧 TODO lasciati nel codice (per Codex / blocchi futuri)

- **Stripe reale:** `lib/booking.ts > mockPayment()` — sostituire con PaymentIntent (Edge Function) + `@stripe/stripe-react-native`. Cercare `TODO(Stripe)`.
- **QR code reale:** `app/booking/confirmation.tsx` — installare `react-native-qrcode-svg` + `react-native-svg`, sostituire il placeholder verde (`TODO(Codex)`).
- **Add to calendar:** `confirmation.tsx > onAddCalendar` — integrare `expo-calendar` (ora è un Alert).
- **Recensioni reali:** `app/field/[id].tsx` — la sezione recensioni è hardcoded; caricare `field_reviews` con join profili (`TODO(Codex)`).
- **Slot booking atomico:** la transizione `is_available → false` è fatta lato client con policy RLS permissiva (`slot update booking`). In produzione spostare in RPC `SECURITY DEFINER` per evitare update arbitrari e race condition reali.
- **Route types:** ho usato `as never` su 4 `router.push/replace` perché i tipi generati di expo-router erano stale. Dopo un `expo start`/`export` i tipi si rigenerano; valutare di rimuovere i cast.

## 🧪 Come testare il flusso end-to-end

1. Applica schema + seed in Supabase (sopra).
2. `npm start` → Expo Go (o `npm run web:preview`).
3. Login → tab "Prenota" → vedi 4 campi.
4. Filtra per sport/prezzo → apri un campo → scegli data e slot → "Prenota".
5. Checkout → "Conferma e paga" (1.5s mock) → schermata conferma con codice M-XXXXXX.
6. Vai su Profilo → la prenotazione appare in "Le mie prenotazioni".

## Cosa NON è incluso (come da spec)

Stripe reale, GPS reale, dashboard gestore (Blocco 3), cancellazione, notifiche push, recensioni post-partita, matchmaking (Blocco 4).
