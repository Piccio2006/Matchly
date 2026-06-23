import { useAuthStore } from '../stores/authStore'

export function useUser() {
  const { profile, stats } = useAuthStore()
  return { profile, stats }
}
