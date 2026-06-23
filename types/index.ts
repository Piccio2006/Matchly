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
