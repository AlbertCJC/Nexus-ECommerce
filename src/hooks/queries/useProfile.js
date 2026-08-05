import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

// Query keys
export const queryKeys = {
  profile: (userId) => ['profile', userId],
}

// Profile
export function useProfile(userId) {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}