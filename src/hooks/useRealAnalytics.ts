import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalRevenue: number;
  totalFollowers: number;
  viewsGrowth: number;
  likesGrowth: number;
  revenueGrowth: number;
  followersGrowth: number;
}

export function useRealAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalLikes: 0,
    totalRevenue: 0,
    totalFollowers: 0,
    viewsGrowth: 0,
    likesGrowth: 0,
    revenueGrowth: 0,
    followersGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Get all artworks by this artist
      const { data: artworks } = await supabase
        .from('artworks')
        .select('id')
        .eq('artist_id', user.id);

      const artworkIds = (artworks || []).map(a => a.id);

      if (artworkIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get views, likes, revenue, and followers in parallel
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [
        viewsData,
        likesData,
        revenueData,
        followersData,
        // For growth calculations
        recentViews,
        previousViews,
        recentLikes,
        previousLikes,
        recentRevenue,
        previousRevenue,
        recentFollowers,
        previousFollowers
      ] = await Promise.all([
        // Total counts
        supabase.from('artwork_views').select('id').in('artwork_id', artworkIds),
        supabase.from('artwork_likes').select('id').in('artwork_id', artworkIds),
        supabase.from('artwork_unlocks').select('amount').in('artwork_id', artworkIds),
        supabase.from('follows').select('id').eq('following_id', user.id),
        // Recent 30 days
        supabase.from('artwork_views').select('id').in('artwork_id', artworkIds)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('artwork_views').select('id').in('artwork_id', artworkIds)
          .gte('created_at', sixtyDaysAgo.toISOString())
          .lt('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('artwork_likes').select('id').in('artwork_id', artworkIds)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('artwork_likes').select('id').in('artwork_id', artworkIds)
          .gte('created_at', sixtyDaysAgo.toISOString())
          .lt('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('artwork_unlocks').select('amount').in('artwork_id', artworkIds)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('artwork_unlocks').select('amount').in('artwork_id', artworkIds)
          .gte('created_at', sixtyDaysAgo.toISOString())
          .lt('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('follows').select('id').eq('following_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('follows').select('id').eq('following_id', user.id)
          .gte('created_at', sixtyDaysAgo.toISOString())
          .lt('created_at', thirtyDaysAgo.toISOString())
      ]);

      // Calculate totals
      const totalViews = viewsData.data?.length || 0;
      const totalLikes = likesData.data?.length || 0;
      const totalRevenue = (revenueData.data || []).reduce((sum, r) => sum + Number(r.amount), 0);
      const totalFollowers = followersData.data?.length || 0;

      // Calculate growth percentages
      const recentViewsCount = recentViews.data?.length || 0;
      const previousViewsCount = previousViews.data?.length || 1; // Avoid division by zero
      const viewsGrowth = previousViewsCount > 0 
        ? Math.round(((recentViewsCount - previousViewsCount) / previousViewsCount) * 100) 
        : recentViewsCount > 0 ? 100 : 0;

      const recentLikesCount = recentLikes.data?.length || 0;
      const previousLikesCount = previousLikes.data?.length || 1;
      const likesGrowth = previousLikesCount > 0 
        ? Math.round(((recentLikesCount - previousLikesCount) / previousLikesCount) * 100) 
        : recentLikesCount > 0 ? 100 : 0;

      const recentRevenueTotal = (recentRevenue.data || []).reduce((sum, r) => sum + Number(r.amount), 0);
      const previousRevenueTotal = (previousRevenue.data || []).reduce((sum, r) => sum + Number(r.amount), 0) || 1;
      const revenueGrowth = previousRevenueTotal > 0 
        ? Math.round(((recentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100) 
        : recentRevenueTotal > 0 ? 100 : 0;

      const recentFollowersCount = recentFollowers.data?.length || 0;
      const previousFollowersCount = previousFollowers.data?.length || 1;
      const followersGrowth = previousFollowersCount > 0 
        ? Math.round(((recentFollowersCount - previousFollowersCount) / previousFollowersCount) * 100) 
        : recentFollowersCount > 0 ? 100 : 0;

      setAnalytics({
        totalViews,
        totalLikes,
        totalRevenue,
        totalFollowers,
        viewsGrowth,
        likesGrowth,
        revenueGrowth,
        followersGrowth
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to views, likes, unlocks, and follows
    const viewsChannel = supabase
      .channel(`analytics-views-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'artwork_views'
      }, () => fetchAnalytics())
      .subscribe();

    const likesChannel = supabase
      .channel(`analytics-likes-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'artwork_likes'
      }, () => fetchAnalytics())
      .subscribe();

    const unlocksChannel = supabase
      .channel(`analytics-unlocks-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'artwork_unlocks'
      }, () => fetchAnalytics())
      .subscribe();

    const followsChannel = supabase
      .channel(`analytics-follows-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${user.id}`
      }, () => fetchAnalytics())
      .subscribe();

    return () => {
      supabase.removeChannel(viewsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(unlocksChannel);
      supabase.removeChannel(followsChannel);
    };
  }, [user?.id, fetchAnalytics]);

  return { analytics, loading, refetch: fetchAnalytics };
}
