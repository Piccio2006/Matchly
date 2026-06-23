export type Sport = 'calcetto' | 'calciotto' | 'padel' | 'tennis'
export type Role = 'portiere' | 'difensore' | 'centrocampista' | 'attaccante'
export type Level = 'bronze' | 'silver' | 'gold' | 'platinum' | 'elite'

export interface Profile {
  id: string
  username: string | null
  full_name: string
  avatar_url: string | null
  city: string | null
  preferred_sports: Sport[]
  preferred_role: Role | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface PlayerStats {
  id: string
  player_id: string
  velocita: number
  resistenza: number
  tecnica: number
  fisico: number
  senso_del_gol: number
  fairplay: number
  leadership: number
  carisma: number
  velocita_peer: number | null
  resistenza_peer: number | null
  tecnica_peer: number | null
  fisico_peer: number | null
  senso_del_gol_peer: number | null
  fairplay_peer: number | null
  leadership_peer: number | null
  carisma_peer: number | null
  matchly_score: number
  level: Level
  total_matches: number
  attended_matches: number
  completed_feedbacks: number
}

export interface StatKey {
  key: keyof Pick<
    PlayerStats,
    | 'velocita'
    | 'resistenza'
    | 'tecnica'
    | 'fisico'
    | 'senso_del_gol'
    | 'fairplay'
    | 'leadership'
    | 'carisma'
  >
  labelIt: string
  labelEn: string
  emoji: string
}

// ============================================================
// Blocco 2: Booking
// ============================================================

// Alias allineato alla spec del Blocco 2 (equivalente a `Sport`)
export type SportType = Sport

export interface SportField {
  id: string
  name: string
  address: string
  city: string
  sport_types: SportType[]
  price_per_slot: number
  slot_duration_minutes: number
  photos: string[]
  description?: string
  surface_type?: string
  amenities: string[]
  max_players: number
  rating_avg: number
  rating_count: number
  latitude?: number
  longitude?: number
  is_active: boolean
  created_at: string
}

export interface FieldSlot {
  id: string
  field_id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  price_override?: number
  discount_percent: number
  discount_expires_at?: string
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export interface Booking {
  id: string
  booking_code: string
  field_id: string
  user_id: string
  slot_id: string
  sport: SportType
  date: string
  start_time: string
  end_time: string
  price_paid: number
  commission_amount: number
  discount_applied: number
  status: BookingStatus
  payment_intent_id?: string
  payment_method?: string
  cancelled_at?: string
  refund_amount?: number
  notes?: string
  created_at: string
  // join
  sports_fields?: SportField
}

export interface FieldReview {
  id: string
  booking_id: string
  field_id: string
  user_id: string
  rating_surface: number
  rating_facilities: number
  rating_structure: number
  rating_value: number
  comment?: string
  created_at: string
}
