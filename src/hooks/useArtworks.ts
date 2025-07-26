import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ArtworkFilters {
  category?: string;
  artistId?: string;
  search?: string;
  status?: 'all' | 'pending' | 'approved' | 'rejected';
}

interface Artwork {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  imageUrl?: string; // Backward compatibility
  artist_id: string;
  artistId?: string; // Backward compatibility
  artist?: string;
  category: string;
  tags?: string[];
  price?: number;
  is_for_sale: boolean;
  is_pinned: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  likes_count: number;
  likes?: number; // Backward compatibility
  views_count: number;
  views?: number; // Backward compatibility
  created_at: string;
  updated_at: string;
  type?: string; // Backward compatibility
  audioUrl?: string; // Backward compatibility
  videoUrl?: string; // Backward compatibility
}

export const useArtworks = (filters: ArtworkFilters = {}) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('artworks')
        .select(`
          *,
          artist:profiles!artworks_artist_id_fkey(
            full_name,
            avatar_url,
            role
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.artistId) {
        query = query.eq('artist_id', filters.artistId);
      } else if (!filters.status || filters.status === 'approved') {
        // For explore page, only show approved artworks
        query = query.eq('approval_status', 'approved');
      }

      if (filters.status && filters.status !== 'all' && filters.artistId) {
        query = query.eq('approval_status', filters.status);
      }

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Process data to add backward compatibility fields
      const processedArtworks = (data || []).map((artwork: any) => ({
        ...artwork,
        // Backward compatibility fields
        imageUrl: artwork.image_url,
        artistId: artwork.artist_id,
        likes: artwork.likes_count,
        views: artwork.views_count,
        type: 'image', // Default type for now
        artist: typeof artwork.artist === 'object' && artwork.artist 
          ? artwork.artist.full_name 
          : artwork.artist
      }));
      
      setArtworks(processedArtworks);
    } catch (err: any) {
      console.error('Error fetching artworks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (artworkId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like artworks",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if already liked
      const { data: existing } = await supabase
        .from('artwork_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('artwork_id', artworkId)
        .single();

      if (existing) {
        // Unlike
        await supabase
          .from('artwork_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('artwork_id', artworkId);
      } else {
        // Like
        await supabase
          .from('artwork_likes')
          .insert({
            user_id: user.id,
            artwork_id: artworkId
          });
      }

      // Refresh artworks to get updated like count
      await fetchArtworks();
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const uploadArtwork = async (artworkData: {
    title: string;
    description?: string;
    category: string;
    tags?: string[];
    price?: number;
    is_for_sale: boolean;
    is_pinned: boolean;
    release_date?: string;
    file: File;
  }) => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    try {
      setLoading(true);

      // Upload image to Supabase Storage
      const fileName = `${Date.now()}-${artworkData.file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, artworkData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);

      // Create artwork record
      const { data, error } = await supabase
        .from('artworks')
        .insert({
          title: artworkData.title,
          description: artworkData.description,
          image_url: publicUrl,
          artist_id: user.id,
          category: artworkData.category,
          tags: artworkData.tags || [],
          price: artworkData.price,
          is_for_sale: artworkData.is_for_sale,
          is_pinned: artworkData.is_pinned,
          approval_status: 'pending',
          release_date: artworkData.release_date
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Artwork uploaded",
        description: "Your artwork has been submitted for review"
      });

      await fetchArtworks();
      return { error: null, data };
    } catch (error: any) {
      console.error('Error uploading artwork:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, [filters.category, filters.artistId, filters.search, filters.status]);

  // Real-time subscription for artworks
  useEffect(() => {
    const subscription = supabase
      .channel('artworks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks'
        },
        () => {
          fetchArtworks();
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
          fetchArtworks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return {
    artworks,
    loading,
    error,
    fetchArtworks,
    toggleLike,
    uploadArtwork,
    refetch: fetchArtworks
  };
};