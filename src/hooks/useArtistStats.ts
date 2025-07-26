import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ArtistStats {
  total_artworks: number;
  approved_artworks: number;
  total_views: number;
  total_likes: number;
  total_followers: number;
  pending_projects: number;
}

export const useArtistStats = (artistId?: string) => {
  const [stats, setStats] = useState<ArtistStats>({
    total_artworks: 0,
    approved_artworks: 0,
    total_views: 0,
    total_likes: 0,
    total_followers: 0,
    pending_projects: 0
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchStats = async () => {
    const targetUserId = artistId || user?.id;
    if (!targetUserId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_artist_stats', { artist_uuid: targetUserId });

      if (error) throw error;

      if (data) {
        setStats(data as unknown as ArtistStats);
      }
    } catch (error: any) {
      console.error('Error fetching artist stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user || artistId) {
      fetchStats();
    }
  }, [user, artistId]);

  // Real-time subscription for stats updates
  useEffect(() => {
    const targetUserId = artistId || user?.id;
    if (!targetUserId) return;

    const subscription = supabase
      .channel('artist_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks',
          filter: `artist_id=eq.${targetUserId}`
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artwork_likes'
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `artist_id=eq.${targetUserId}`
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `artist_id=eq.${targetUserId}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, artistId]);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
};