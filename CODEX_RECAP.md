# Codex Recap - Blocco 1 Review

Ultimo aggiornamento: 2026-06-23

## Stato

Codex ha rivisto il blocco 1 senza aggiungere nuove feature di prodotto. Le modifiche sono correzioni di flusso, chiarezza UX e robustezza minima.

## Correzioni applicate

- Sistemato il gate di navigazione in `app/_layout.tsx`: login, logout, onboarding incompleto e onboarding completato ora reindirizzano in modo coerente.
- Aggiunto `SafeAreaProvider` e `StatusBar` nel root layout.
- Resa sicura la gestione dello splash screen: su web non viene piu chiamato lo splash nativo, riducendo il rischio di schermata bianca.
- Stabilizzata la dipendenza del redirect root usando il gruppo di rotta attivo invece dell'intero array `segments`.
- Aggiunti script web stabili:
  - `npm run web:build`
  - `npm run web:preview`
- `web:preview` esporta l'app e la serve da `dist` con Python, evitando il watcher di Expo che sul Mac puo fallire con `EMFILE: too many open files`.
- Raffinata `metro.config.js` per ignorare cartelle pesanti come `.git`, `.expo`, `dist` e `node_modules` annidati.
- Login e signup mostrano un errore chiaro se Supabase non è configurato.
- Login e signup mostrano il messaggio reale dell'errore Supabase quando disponibile.
- Signup mostra un messaggio chiaro quando Supabase richiede conferma via email.
- I bottoni Google/Apple sono disabilitati e marcati come "presto", invece di sembrare funzionanti senza fare nulla.
- "Password dimenticata" mostra un messaggio "in arrivo" invece di essere un'azione vuota.
- Il form auth valida email/password vuote prima di chiamare Supabase.
- Il form auth pulisce gli errori locali quando l'utente modifica i campi.
- L'onboarding controlla che esista un utente autenticato prima di scrivere profilo/statistiche/ruolo.
- La schermata statistiche onboarding ora usa 7 statistiche, come da master plan, non 8.
- Le soglie Matchly Score sono riallineate al master plan:
  - Bronze: 1.0-3.9
  - Silver: 4.0-5.9
  - Gold: 6.0-7.9
  - Platinum: 8.0-9.4
  - Elite: 9.5-10.0
- La waitlist matchmaking valida l'email e gestisce meglio i duplicati.
- Aggiunte traduzioni mancanti in italiano e inglese.
- `supabase/schema.sql` e stato reso piu robusto per il primo setup:
  - `CREATE TABLE IF NOT EXISTS`
  - `DROP POLICY IF EXISTS` prima di ricreare policy
  - trigger aggiornabili senza errore se rilanci lo script
  - vincoli base su statistiche, score e livelli
  - policy RLS piu esplicite per profilo, statistiche e waitlist

## Perche login/signup davano errore

Il file `.env.local` ora contiene il Project URL Supabase reale:

```env
EXPO_PUBLIC_SUPABASE_URL=https://pkbrzpwhkrhcdiuhswww.supabase.co
```

La chiave pubblicabile Supabase reale e stata inserita in `.env.local` nel formato `sb_publishable_...`.

Serve:

```env
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Nota: la variabile si chiama ancora `EXPO_PUBLIC_SUPABASE_ANON_KEY` per compatibilita con il codice esistente, ma il valore puo essere una publishable key Supabase moderna.

Dopo aver cambiato `.env.local`, riavviare Expo. Se la cache fa scherzi, avviare con cache pulita.

## Come provare l'app

Web:

```bash
npm run web
```

Web senza watcher Expo, consigliato se appare `EMFILE` o schermata bianca:

```bash
npm run web:preview
```

Poi aprire:

```text
http://localhost:8081
```

Mobile reale con Expo Go:

```bash
npm start
```

Poi scansionare il QR code con Expo Go su iPhone/Android.

iOS Simulator:

```bash
npm run ios
```

Android Emulator:

```bash
npm run android
```

Nota: se si usa `npm run web`, Expo apre la versione web nel browser. Non vuol dire che l'app sia nata come sito: Expo puo renderizzare la stessa app anche su web per test rapidi.

## Cosa fare adesso in Supabase

1. Aprire il progetto Supabase.
2. Entrare in `SQL Editor`.
3. Creare una nuova query.
4. Copiare tutto `supabase/schema.sql`.
5. Incollare nel SQL Editor.
6. Premere `Run`.
7. Se Supabase mostra errori, copiare/screenshotare l'errore prima di fare altri tentativi.

## Punti ancora aperti

- Expo SDK: il progetto e ancora su SDK 51, mentre `AGENTS.md` chiede Expo v56. La migrazione SDK 51 -> 56 e ampia e va fatta come task dedicato.
- Supabase reale: URL e publishable key sono inseriti. Resta da applicare `supabase/schema.sql` nel progetto Supabase.
- Social login Google/Apple: per ora disabilitati per non mostrare azioni finte.
- Booking: resta placeholder. Se il blocco 1 includeva solo scaffold/onboarding va bene; se include MVP booking, manca ancora il cuore del prodotto.

## Verifiche eseguite

- `npx tsc --noEmit`
- `git diff --check`

Nota: un controllo di raggiungibilita Supabase dal terminale locale ha fallito con `fetch failed`. Non e stato considerato bloccante perche puo dipendere dall'ambiente/rete del terminale. La verifica pratica resta: applicare lo schema in Supabase e provare signup/login da Expo.
