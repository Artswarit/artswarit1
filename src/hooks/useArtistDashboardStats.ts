import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLogging } from '@/components/logging/LoggingProvider';

interface ArtistStats {
  totalViews: number;
  monthlyEarnings: number;
  totalArtworks: number;
  followers: number;
  totalEarnings: number;
  totalSales: number;
}

export const useArtistDashboardStats = () => {
  const { user } = useAuth();
  const { logAndTrack } = useLogging();
  const [stats, setStats] = useState<ArtistStats>({
    totalViews: 0,
    monthlyEarnings: 0,
    totalArtworks: 0,
    followers: 0,
    totalEarnings: 0,
    totalSales: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Call the existing edge function
      const { data, error } = await supabase.functions.invoke('get-artist-dashboard-stats', {
        body: { artist_id: user.id }
      });

      if (error) throw error;

      if (data) {
        setStats({
          totalViews: data.total_views || 0,
          monthlyEarnings: data.monthly_earnings || 0,
          totalArtworks: data.total_artworks || 0,
          followers: data.total_followers || 0,
          totalEarnings: data.total_earnings || 0,
          totalSales: data.total_sales || 0
        });
      }

      // Log the successful fetch
      await logAndTrack(
        'fetchArtistStats',
        'useArtistDashboardStats',
        'data_fetch',
        { artist_id: user.id },
        data
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      
      // Log the error
      await logAndTrack(
        'fetchArtistStats',
        'useArtistDashboardStats',
        'error',
        { artist_id: user.id },
        undefined,
        err instanceof Error ? err : new Error(errorMessage)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  // Set up real-time subscriptions for live updates
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to artwork changes
    const artworkChannel = supabase
      .channel('artwork-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks',
          filter: `artist_id=eq.${user.id}`
        },
        () => {
          fetchStats(); // Refresh stats when artworks change
        }
      )
      .subscribe();

    // Subscribe to follows changes
    const followsChannel = supabase
      .channel('follows-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${user.id}`
        },
        () => {
          fetchStats(); // Refresh stats when follows change
        }
      )
      .subscribe();

    // Subscribe to sales changes
    const salesChannel = supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
          filter: `artist_id=eq.${user.id}`
        },
        () => {
          fetchStats(); // Refresh stats when sales change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(artworkChannel);
      supabase.removeChannel(followsChannel);
      supabase.removeChannel(salesChannel);
    };
  }, [user?.id]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};