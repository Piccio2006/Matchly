import { FieldSlot, SportField } from '../types'

// Commissione piattaforma Matchly applicata sul prezzo pagato.
export const COMMISSION_RATE = 0.1

/**
 * Calcola il prezzo effettivo di uno slot tenendo conto di:
 * - price_override dello slot (se presente), altrimenti price_per_slot del campo
 * - discount_percent dello slot (se ancora valido)
 */
export function computeSlotPrice(
  slot: Pick<FieldSlot, 'price_override' | 'discount_percent' | 'discount_expires_at'>,
  field: Pick<SportField, 'price_per_slot'>
): { basePrice: number; finalPrice: number; discountPercent: number } {
  const basePrice = slot.price_override ?? field.price_per_slot
  const discountActive =
    slot.discount_percent > 0 &&
    (!slot.discount_expires_at || new Date(slot.discount_expires_at) > new Date())
  const discountPercent = discountActive ? slot.discount_percent : 0
  const finalPrice = Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100
  return { basePrice, finalPrice, discountPercent }
}

export function computeCommission(pricePaid: number): number {
  return Math.round(pricePaid * COMMISSION_RATE * 100) / 100
}

/** Genera un codice prenotazione tipo "M-483921". */
export function generateBookingCode(): string {
  const digits = Math.floor(100000 + Math.random() * 900000)
  return `M-${digits}`
}

/**
 * MOCK PAGAMENTO — Stripe non integrato.
 * TODO(Stripe): sostituire con creazione reale di un PaymentIntent
 * (Edge Function lato server) e conferma con @stripe/stripe-react-native.
 * Per ora simula un delay e ritorna sempre successo.
 */
export async function mockPayment(): Promise<{ paymentIntentId: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return { paymentIntentId: `mock_${Date.now()}` }
}

const SPORT_EMOJI: Record<string, string> = {
  calcetto: '⚽',
  calciotto: '⚽',
  padel: '🎾',
  tennis: '🎾',
}

export function sportEmoji(sport: string): string {
  return SPORT_EMOJI[sport] ?? '🏟️'
}

/** Distanza approssimata (km) tra due punti — formula haversine semplificata. */
export function approxDistanceKm(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
}

// Centro di Firenze fisso (no GPS reale in questo blocco).
export const FIRENZE_CENTER = { latitude: 43.7696, longitude: 11.2558 }

/** "HH:MM:SS" o "HH:MM" → "HH:MM" */
export function formatTime(t: string): string {
  return t.slice(0, 5)
}
