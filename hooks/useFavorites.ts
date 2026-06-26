import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export function useFavorites() {
  const { session } = useAuthStore()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) { setLoading(false); return }
    supabase
      .from('field_favorites')
      .select('field_id')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        setFavoriteIds(new Set((data ?? []).map((r) => r.field_id as string)))
        setLoading(false)
      })
  }, [session?.user?.id])

  const toggle = useCallback(async (fieldId: string) => {
    if (!session?.user) return
    const isFav = favoriteIds.has(fieldId)
    if (isFav) {
      setFavoriteIds((prev) => { const s = new Set(prev); s.delete(fieldId); return s })
      await supabase.from('field_favorites').delete().eq('user_id', session.user.id).eq('field_id', fieldId)
    } else {
      setFavoriteIds((prev) => new Set([...prev, fieldId]))
      await supabase.from('field_favorites').insert({ user_id: session.user.id, field_id: fieldId })
    }
  }, [session?.user?.id, favoriteIds])

  return { favoriteIds, toggle, loading }
}
