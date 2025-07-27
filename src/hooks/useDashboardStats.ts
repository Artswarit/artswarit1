import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  total_artworks: number;
  total_views: number;
  monthly_earnings: number;
  total_followers: number;
  total_sales: number;
  total_earnings: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_artworks: 0,
    total_views: 0,
    monthly_earnings: 0,
    total_followers: 0,
    total_sales: 0,
    total_earnings: 0
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_artist_dashboard_stats', { artist_uuid: user.id });

      if (error) throw error;

      if (data) {
        setStats(data as unknown as DashboardStats);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  // Real-time subscriptions for stats updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('dashboard_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks',
          filter: `artist_id=eq.${user.id}`
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
          table: 'sales',
          filter: `artist_id=eq.${user.id}`
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
          filter: `artist_id=eq.${user.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
};