
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Returns: number
export function useArtistFollowersCount(artistId: string | undefined) {
  return useQuery({
    queryKey: ['artistFollowers', artistId],
    queryFn: async () => {
      if (!artistId) return 0;
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: "exact", head: true })
        .eq('artist_id', artistId);
      if (error) {
        // Fail gracefully, just show 0
        return 0;
      }
      return count || 0;
    },
    enabled: !!artistId
  });
}
