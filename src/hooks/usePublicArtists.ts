import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicArtist {
  id: string;
  name: string;
  tagline: string; // Make required to match ArtistCard expectations
  category: string; // Make required to match ArtistCard expectations
  imageUrl: string;
  verified: boolean;
  premium: boolean;
  featured: boolean;
  available: boolean;
  followers: number;
  artworkCount: number;
  rating: number;
  location: string;
  priceRange: string;
  viewsCount: number;
  likesCount: number;
  joinedDate: string;
  tags: string[];
}

export const usePublicArtists = () => {
  const [artists, setArtists] = useState<PublicArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      
      // Fetch artist profiles with their artwork counts and stats
      const { data: profiles, error: profilesError } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('role', 'artist')
        .eq('account_status', 'approved');

      if (profilesError) throw profilesError;

      // Transform the data to match the expected format
      const transformedArtists = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get artwork count for this artist
          const { count: artworkCount } = await supabase
            .from('artworks')
            .select('*', { count: 'exact', head: true })
            .eq('artist_id', profile.id)
            .eq('status', 'public');

          // Get follower count
          const { count: followersCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profile.id);

          return {
            id: profile.id || '',
            name: profile.full_name || 'Unknown Artist',
            tagline: profile.bio || 'Creative artist on Artswarit',
            category: profile.role || 'Artist',
            imageUrl: profile.avatar_url || 'https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
            verified: profile.is_verified || false,
            premium: false, // You can implement premium logic later
            featured: false, // You can implement featured logic later
            available: true,
            followers: followersCount || 0,
            artworkCount: artworkCount || 0,
            rating: 4.5, // Default rating, implement real rating system later
            location: profile.location || '',
            priceRange: profile.hourly_rate ? '$$$' : '$$',
            viewsCount: 0, // Implement view tracking later
            likesCount: 0, // Implement like tracking later
            joinedDate: profile.created_at || new Date().toISOString(),
            tags: profile.tags || []
          } as PublicArtist;
        })
      );

      setArtists(transformedArtists);
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  return {
    artists,
    loading,
    error,
    refetch: fetchArtists
  };
};