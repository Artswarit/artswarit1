
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

// Returns: boolean (is following artist)
export function useIsFollowingArtist(artistId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['isFollowing', artistId, user?.id || "notloggedin"],
    queryFn: async () => {
      if (!user || !artistId) return false;
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('artist_id', artistId)
        .eq('client_id', user.id)
        .maybeSingle();
      if (error || !data) return false;
      return !!data.id;
    },
    enabled: !!user && !!artistId
  });
}
