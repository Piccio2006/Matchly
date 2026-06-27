# CODEX RECAP — Blocco 3

**Data:** 2026-06-26  
**Ramo:** main  
**Commit blocco:** da `b68d04c` a `6c4bb76` (8 commit)

---

## A — Bug Fix

| ID | Stato | Descrizione |
|----|-------|-------------|
| A1 | ✅ | Home screen carica campi reali da Supabase (`rating_avg DESC`, limit 6) + offerte del giorno (`discount_percent > 0`) |
| A2 | ✅ | `/notifications` screen con lettura/mark-as-read da tabella `notifications`; campanella home naviga a schermata |
| A3 | ⏳ | Stripe non integrato — `mockPayment()` ancora attivo (richiede `@stripe/stripe-react-native`, SDK 56) |
| A4 | ✅ | RPC `book_slot` atomica in Postgres (`FOR UPDATE` lock) — elimina race condition |
| A5 | ⏳ | QR code rimandato (richiede `react-native-qrcode-svg` + `react-native-svg`) |
| A6 | ⏳ | Calendar (`expo-calendar`) rimandato — pacchetto non installato |
| A7 | ✅ | Recensioni reali da `field_reviews` nel dettaglio campo; rating calcolato come media di 4 sub-criteri |
| A8 | ✅ | Voci menu profilo "Storico partite" → `/match-history`, "Impostazioni" → `/settings` (schermate create) |
| A9 | ✅ | `STAT_KEYS` espanso a tutti gli 8 stat: aggiunta `senso_del_gol`, `fairplay`, `leadership`, `carisma` |
| A10 | ✅ | Filtro prezzo default "Tutti i prezzi" (null); aggiunto chip "🏷️ Solo offerte" |
| A11 | ✅ | Città letta da `profile?.city` (già fatto in home screen A1) |
| A12 | ⏳ | GPS via `expo-location` rimandato — pacchetto non installato |

---

## B — Nuove Feature

| ID | Stato | Descrizione |
|----|-------|-------------|
| B1 | ⏳ | Mappa (`react-native-maps`) — pacchetto non installato |
| B2 | ✅ | Preferiti: `field_favorites` su Supabase, hook `useFavorites`, schermata `/favorites`, voce menu profilo |
| B3 | ⏳ | Last-minute offer push notifications — richiede notifiche push native |
| B4 | ✅ | Cancellazione prenotazioni: pulsante "Annulla" in lista prenotazioni, Alert con differenziazione >2h / <2h |
| B5 | ✅ | Recensione post-partita: schermata `/booking/review` con 4 criteri a stelle + commento; pulsante su prenotazioni completate |
| B6 | ✅ | Classifica `/leaderboard` top-50 giocatori per `matchly_score`; voce menu profilo |
| B7 | ⏳ | Achievements — no tabella Supabase ancora |
| B8 | ⏳ | Profile sharing — richiede deep links (D9) |
| B9 | ✅ | Widget "Campo del giorno" in home: campo con rating più alto con slot disponibili oggi |
| B10 | ⏳ | Onboarding tips — rimandato |
| B11 | ⏳ | Filtri avanzati — parzialmente fatto (A10) |
| B12 | ⏳ | Match history UI — schermata creata (A8), filtri avanzati rimandati |

---

## C — Web Dashboard

| ID | Stato | Descrizione |
|----|-------|-------------|
| C1 | ⏳ | Webhook logging — nessuna Edge Function ancora |
| C2 | ⏳ | Miglioramenti manager page — struttura già buona |
| C3 | ⏳ | Calendario slot — rimandato |
| C4 | ⏳ | Analytics avanzate — `manager.insights.tsx` già presente |
| C5 | ✅ | **Pagina pubblica campo** `/campo/:id` (web) con disponibilità, recensioni, CTA; pulsante "Copia link" nel pannello manager |

---

## D — Technical

| ID | Stato | Descrizione |
|----|-------|-------------|
| D1 | ⏳ | SDK 51 → 56 migration — LAST (non toccato, breaking changes) |
| D2 | ✅ | `ErrorBoundary` React class component; wrappa il root layout |
| D3 | ⏳ | Accessibility labels — rimandato |
| D4 | ⏳ | Haptics (`expo-haptics`) — pacchetto non installato |
| D5 | ⏳ | Image lazy loading — rimandato |
| D6 | ⏳ | AsyncStorage cache — `@react-native-async-storage/async-storage` non installato |
| D7 | ✅ | EN locale già completo con tutti i tasti inclusi nuovi (`stats.*`) |
| D8 | ⏳ | Offline mode — rimandato |
| D9 | ⏳ | Deep links — rimandato |
| D10 | ⏳ | Performance profiling — rimandato |

---

## E — Backend (Supabase)

| ID | Stato | Descrizione |
|----|-------|-------------|
| E1 | ✅ | Trigger `trg_update_field_rating`: aggiorna `sports_fields.rating_avg` e `rating_count` dopo ogni `field_review` |
| E2 | ✅ | Trigger `trg_matchly_score`: ricalcola `player_stats.matchly_score` dopo ogni booking completato |
| E3 | ✅ | `schema_blocco3.sql` aggiornato (già presente dalla sessione precedente) |
| E4 | ✅ | `ALTER PUBLICATION supabase_realtime ADD TABLE field_slots` in `schema_blocco3_triggers.sql` |

---

## SQL da applicare su Supabase

Applicare nell'ordine:

```sql
-- 1. Trigger rating + matchly_score + realtime
\i supabase/schema_blocco3_triggers.sql

-- 2. RPC atomica book_slot  
\i supabase/rpc_book_slot.sql

-- 3. Tabella preferiti
\i supabase/schema_favorites.sql

-- 4. RPC atomica cancel_booking (annulla + rilibera lo slot)
\i supabase/rpc_cancel_booking.sql
```

> **Bugfix:** `cancel_booking` risolve un bug per cui annullare una
> prenotazione lasciava lo slot `is_available = FALSE` (slot perso per
> sempre). Ora la cancellazione rilibera atomicamente lo slot.

---

## Pacchetti native da installare (Blocco 4)

```bash
npx expo install expo-location        # A12 GPS
npx expo install expo-haptics         # D4 haptics
npx expo install expo-calendar        # A6 add-to-calendar
npx expo install react-native-maps    # B1 mappa
npx expo install react-native-qrcode-svg react-native-svg  # A5 QR code
npx expo install @react-native-async-storage/async-storage # D6 cache
```

**Nota:** dopo l'installazione di questi pacchetti eseguire `npx expo prebuild --clean` prima di costruire.

---

## Pacchetti installati in Blocco 3

Nessun pacchetto nativo aggiunto — tutte le feature di Blocco 3 usano solo librerie già presenti.

---

## Architettura attuale (post-Blocco 3)

```
app/
  (tabs)/
    index.tsx       ← campi reali + offerte + campo del giorno
    booking.tsx     ← filtro prezzi migliorato + solo-offerte chip
    profile.tsx     ← 8 stat, menu completo (preferiti, classifica, storico, impostazioni)
  field/[id].tsx    ← recensioni reali
  booking/
    checkout.tsx    ← usa book_slot RPC (no race condition)
    review.tsx      ← NEW: recensione post-partita
  bookings/index.tsx ← cancellazione + link recensione
  notifications.tsx  ← NEW
  leaderboard.tsx    ← NEW
  favorites.tsx      ← NEW
  match-history.tsx  ← NEW
  settings.tsx       ← NEW
  _layout.tsx        ← ErrorBoundary, route registrations

components/ui/
  ErrorBoundary.tsx  ← NEW

hooks/
  useFavorites.ts    ← NEW

supabase/
  schema_blocco3_triggers.sql  ← NEW (E1/E2/E4)
  rpc_book_slot.sql            ← NEW (A4)
  schema_favorites.sql         ← NEW (B2)

web (match-play-finder-41):
  src/routes/campo.$id.tsx     ← NEW public field page (C5)
```
