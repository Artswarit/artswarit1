import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/components/logging/LoggingProvider';

interface TrendingArtwork {
  id: string;
  title: string;
  artist_name: string;
  artist_id: string;
  media_url: string;
  category: string;
  views_count: number;
  likes_count: number;
  created_at: string;
}

export const useRealTimeTrending = () => {
  const { logAndTrack } = useLogging();
  const [trendingArtworks, setTrendingArtworks] = useState<TrendingArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingArtworks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trending artworks based on recent engagement
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          media_url,
          category,
          created_at,
          artist_id,
          users!artworks_artist_id_fkey(name)
        `)
        .eq('status', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform the data to include artist names
      const transformedData = (data || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist_name: artwork.users?.name || 'Unknown Artist',
        artist_id: artwork.artist_id,
        media_url: artwork.media_url,
        category: artwork.category,
        views_count: 0, // This would be calculated from actual views
        likes_count: 0, // This would be calculated from actual likes
        created_at: artwork.created_at
      }));

      setTrendingArtworks(transformedData);

      // Log successful fetch
      await logAndTrack(
        'fetchTrendingArtworks',
        'useRealTimeTrending',
        'data_fetch',
        {},
        { count: transformedData.length }
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trending artworks';
      setError(errorMessage);
      
      // Log error
      await logAndTrack(
        'fetchTrendingArtworks',
        'useRealTimeTrending',
        'error',
        {},
        undefined,
        err instanceof Error ? err : new Error(errorMessage)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingArtworks();
  }, []);

  // Set up real-time subscription for new artworks
  useEffect(() => {
    const channel = supabase
      .channel('trending-artworks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'artworks'
        },
        () => {
          fetchTrendingArtworks(); // Refresh when new artworks are added
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artworks'
        },
        () => {
          fetchTrendingArtworks(); // Refresh when artworks are updated
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    trendingArtworks,
    loading,
    error,
    refetch: fetchTrendingArtworks
  };
};