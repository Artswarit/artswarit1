import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useArtworkViews = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const incrementView = async (artworkId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('increment_artwork_views', {
          artwork_uuid: artworkId,
          user_uuid: user.id
        });

      if (error) {
        console.error('Error incrementing view:', error);
        return;
      }

      return data;
    } catch (error: any) {
      console.error('Error incrementing view:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    incrementView,
    loading
  };
};