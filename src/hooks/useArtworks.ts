
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Artwork {
  id: string;
  artist_id: string;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  tags: string[];
  price?: number;
  is_for_sale: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  release_date?: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
}

export const useArtworks = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArtworks = async (filters?: {
    category?: string;
    featured?: boolean;
    pinned?: boolean;
    artist_id?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('artworks')
        .select(`
          *,
          profiles:artist_id (
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }
      if (filters?.pinned) {
        query = query.eq('is_pinned', true);
      }
      if (filters?.artist_id) {
        query = query.eq('artist_id', filters.artist_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching artworks:', error);
        setError(error.message);
        return;
      }

      setArtworks(data || []);
    } catch (err: any) {
      console.error('Error fetching artworks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadArtwork = async (artworkData: {
    title: string;
    description?: string;
    category: string;
    tags: string[];
    price?: number;
    is_for_sale: boolean;
    is_pinned?: boolean;
    release_date?: string;
    file: File;
  }) => {
    try {
      setLoading(true);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', artworkData.file);
      formData.append('upload_preset', 'artswarit_uploads'); // You'll need to set this up in Cloudinary

      const cloudinaryResponse = await fetch(
        'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', // Replace with your Cloudinary cloud name
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const imageUrl = cloudinaryData.secure_url;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Save artwork to database
      const { data, error } = await supabase
        .from('artworks')
        .insert({
          artist_id: user.id,
          title: artworkData.title,
          description: artworkData.description,
          image_url: imageUrl,
          category: artworkData.category,
          tags: artworkData.tags,
          price: artworkData.price,
          is_for_sale: artworkData.is_for_sale,
          is_pinned: artworkData.is_pinned || false,
          release_date: artworkData.release_date,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving artwork:', error);
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Artwork uploaded",
        description: "Your artwork has been uploaded successfully."
      });

      // Refresh artworks
      await fetchArtworks();

      return { data, error: null };
    } catch (err: any) {
      console.error('Error uploading artwork:', err);
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive"
      });
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (artworkId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to like artworks.",
          variant: "destructive"
        });
        return;
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('artwork_likes')
        .select('id')
        .eq('artwork_id', artworkId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('artwork_likes')
          .delete()
          .eq('artwork_id', artworkId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('artwork_likes')
          .insert({
            artwork_id: artworkId,
            user_id: user.id,
          });
      }

      // Refresh artworks to update like counts
      await fetchArtworks();
    } catch (err: any) {
      console.error('Error toggling like:', err);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  return {
    artworks,
    loading,
    error,
    fetchArtworks,
    uploadArtwork,
    toggleLike,
    refetch: fetchArtworks
  };
};
