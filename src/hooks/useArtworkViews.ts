import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useArtworkViews = () => {
  const incrementView = async (artworkId: string) => {
    try {
      // First get current view count
      const { data: currentData } = await supabase
        .from('artworks')
        .select('views_count')
        .eq('id', artworkId)
        .single();

      // Increment view count in the database
      const { error } = await supabase
        .from('artworks')
        .update({ 
          views_count: (currentData?.views_count || 0) + 1
        })
        .eq('id', artworkId);

      if (error) {
        console.error('Error incrementing view count:', error);
      }
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  };

  return { incrementView };
};