
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Artwork {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  artist_id: string;
  category: string;
  tags: string[];
  price: number | null;
  is_for_sale: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  approval_status: string;
  likes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  release_date: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useArtworks = (artistId?: string) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
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
          profiles:artist_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching artworks:', fetchError);
        setError(fetchError.message);
        toast({
          title: "Error",
          description: "Failed to load artworks. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched artworks from DB:', data);
      setArtworks(data || []);
    } catch (err: any) {
      console.error('Error in fetchArtworks:', err);
      setError(err.message);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadArtwork = async (artworkData: {
    title: string;
    description?: string;
    image_url: string;
    category: string;
    tags?: string[];
    price?: number;
    is_for_sale?: boolean;
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload artwork.",
        variant: "destructive",
      });
      return { error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('artworks')
        .insert([{
          ...artworkData,
          artist_id: user.id,
          tags: artworkData.tags || [],
          is_for_sale: artworkData.is_for_sale || false,
          approval_status: 'pending',
        }])
        .select()
        .single();

      if (error) {
        console.error('Error uploading artwork:', error);
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Artwork Uploaded",
        description: "Your artwork has been uploaded successfully!",
      });

      // Refresh artworks list
      await fetchArtworks();
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in uploadArtwork:', err);
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const updateArtwork = async (artworkId: string, updates: Partial<Artwork>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to update artwork.",
        variant: "destructive",
      });
      return { error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('artworks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', artworkId)
        .eq('artist_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating artwork:', error);
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Artwork Updated",
        description: "Your artwork has been updated successfully!",
      });

      // Refresh artworks list
      await fetchArtworks();
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in updateArtwork:', err);
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const deleteArtwork = async (artworkId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete artwork.",
        variant: "destructive",
      });
      return { error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', artworkId)
        .eq('artist_id', user.id);

      if (error) {
        console.error('Error deleting artwork:', error);
        toast({
          title: "Delete Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Artwork Deleted",
        description: "Your artwork has been deleted successfully!",
      });

      // Refresh artworks list
      await fetchArtworks();
      
      return { error: null };
    } catch (err: any) {
      console.error('Error in deleteArtwork:', err);
      toast({
        title: "Delete Failed",
        description: err.message,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const likeArtwork = async (artworkId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like artworks.",
        variant: "destructive",
      });
      return { error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase.functions.invoke('social-features', {
        body: {
          action: 'like_artwork',
          data: {
            userId: user.id,
            artworkId
          }
        }
      });

      if (error) {
        console.error('Error liking artwork:', error);
        toast({
          title: "Error",
          description: "Failed to like artwork. Please try again.",
          variant: "destructive",
        });
        return { error };
      }

      // Refresh artworks to update like count
      await fetchArtworks();
      
      return { error: null };
    } catch (err: any) {
      console.error('Error in likeArtwork:', err);
      return { error: err.message };
    }
  };

  const unlikeArtwork = async (artworkId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to unlike artworks.",
        variant: "destructive",
      });
      return { error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase.functions.invoke('social-features', {
        body: {
          action: 'unlike_artwork',
          data: {
            userId: user.id,
            artworkId
          }
        }
      });

      if (error) {
        console.error('Error unliking artwork:', error);
        toast({
          title: "Error",
          description: "Failed to unlike artwork. Please try again.",
          variant: "destructive",
        });
        return { error };
      }

      // Refresh artworks to update like count
      await fetchArtworks();
      
      return { error: null };
    } catch (err: any) {
      console.error('Error in unlikeArtwork:', err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, [artistId, user]);

  return {
    artworks,
    loading,
    error,
    fetchArtworks,
    uploadArtwork,
    updateArtwork,
    deleteArtwork,
    likeArtwork,
    unlikeArtwork,
  };
};
