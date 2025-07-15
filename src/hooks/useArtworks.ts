
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useArtworks = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArtworks = async () => {
    console.log('Fetching artworks from Supabase...');
    setLoading(true);
    
    try {
      const { data: dbArtworks, error: fetchError } = await supabase
        .from('artworks')
        .select(`
          *,
          profiles!artworks_artist_id_fkey(full_name, avatar_url)
        `)
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching artworks:', fetchError);
        setError(fetchError.message);
        setArtworks([]);
      } else {
        console.log('Fetched artworks from DB:', dbArtworks);
        
        const transformedArtworks = dbArtworks?.map(artwork => ({
          id: artwork.id,
          title: artwork.title,
          artist: artwork.profiles?.full_name || 'Unknown Artist',
          artistId: artwork.artist_id,
          artist_id: artwork.artist_id,
          type: getArtworkType(artwork.category),
          imageUrl: artwork.image_url,
          likes: artwork.likes_count || 0,
          views: artwork.views_count || 0,
          price: artwork.price || 0,
          category: artwork.category,
          is_pinned: artwork.is_pinned || false,
          is_for_sale: artwork.is_for_sale || false,
          tags: artwork.tags || [],
          approval_status: artwork.approval_status || 'pending',
          created_at: artwork.created_at,
          description: artwork.description
        })) || [];

        setArtworks(transformedArtworks);
      }
    } catch (err) {
      console.error('Error in fetchArtworks:', err);
      setError('Failed to fetch artworks');
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  const getArtworkType = (category) => {
    const lowerCategory = category?.toLowerCase() || '';
    if (lowerCategory.includes('music') || lowerCategory.includes('audio') || lowerCategory.includes('sound')) {
      return 'music';
    }
    if (lowerCategory.includes('video') || lowerCategory.includes('film') || lowerCategory.includes('movie')) {
      return 'video';
    }
    if (lowerCategory.includes('text') || lowerCategory.includes('writing') || lowerCategory.includes('literature')) {
      return 'text';
    }
    return 'image';
  };

  const uploadToStorage = async (file, fileName) => {
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(`${user.id}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('artworks')
        .getPublicUrl(`${user.id}/${fileName}`);

      return urlData.publicUrl;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  };

  const uploadArtwork = async (artworkData) => {
    console.log('Starting artwork upload:', artworkData);
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload artwork.",
        variant: "destructive",
      });
      return { error: "User not authenticated" };
    }

    try {
      let imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
      
      if (artworkData.file) {
        const fileName = `${Date.now()}-${artworkData.file.name}`;
        imageUrl = await uploadToStorage(artworkData.file, fileName);
        console.log('File uploaded to storage:', imageUrl);
      }

      const dbArtworkData = {
        title: artworkData.title,
        description: artworkData.description || null,
        category: artworkData.category,
        tags: artworkData.tags || [],
        price: artworkData.price || null,
        is_for_sale: artworkData.is_for_sale || false,
        is_pinned: artworkData.is_pinned || false,
        image_url: imageUrl,
        artist_id: user.id,
        approval_status: 'approved',
        release_date: artworkData.release_date || null,
        views_count: 0,
        likes_count: 0
      };

      console.log('Inserting artwork to database:', dbArtworkData);

      const { data: newArtwork, error: insertError } = await supabase
        .from('artworks')
        .insert([dbArtworkData])
        .select(`
          *,
          profiles!artworks_artist_id_fkey(full_name, avatar_url)
        `)
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      console.log('Artwork successfully uploaded to database:', newArtwork);

      const transformedArtwork = {
        id: newArtwork.id,
        title: newArtwork.title,
        artist: newArtwork.profiles?.full_name || user.user_metadata?.full_name || 'Unknown Artist',
        artistId: newArtwork.artist_id,
        artist_id: newArtwork.artist_id,
        type: getArtworkType(newArtwork.category),
        imageUrl: newArtwork.image_url,
        likes: newArtwork.likes_count || 0,
        views: newArtwork.views_count || 0,
        price: newArtwork.price || 0,
        category: newArtwork.category,
        is_pinned: newArtwork.is_pinned || false,
        is_for_sale: newArtwork.is_for_sale || false,
        tags: newArtwork.tags || [],
        approval_status: newArtwork.approval_status || 'pending',
        created_at: newArtwork.created_at,
        description: newArtwork.description
      };

      setArtworks(prevArtworks => [transformedArtwork, ...prevArtworks]);

      toast({
        title: "Success",
        description: "Artwork uploaded successfully and is now visible on the explore page and your profile!",
      });
      
      return { error: null, artwork: transformedArtwork };
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload artwork. Please try again.",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  const toggleLike = async (artworkId) => {
    console.log(`Toggling like for artwork: ${artworkId}`);
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like artworks.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: existingLike, error: checkError } = await supabase
        .from('artwork_likes')
        .select('id')
        .eq('artwork_id', artworkId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking like status:', checkError);
        throw checkError;
      }

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('artwork_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;
        
        toast({
          title: "Unliked",
          description: "Artwork removed from likes.",
        });
      } else {
        const { error: insertError } = await supabase
          .from('artwork_likes')
          .insert([{
            artwork_id: artworkId,
            user_id: user.id
          }]);

        if (insertError) throw insertError;
        
        toast({
          title: "Liked",
          description: "Artwork added to your likes!",
        });
      }

      fetchArtworks();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchUserArtworks = async (userId) => {
    console.log('Fetching user artworks for:', userId);
    
    try {
      const { data: userArtworks, error: fetchError } = await supabase
        .from('artworks')
        .select(`
          *,
          profiles!artworks_artist_id_fkey(full_name, avatar_url)
        `)
        .eq('artist_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching user artworks:', fetchError);
        return [];
      }

      return userArtworks?.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.profiles?.full_name || 'Unknown Artist',
        artistId: artwork.artist_id,
        artist_id: artwork.artist_id,
        type: getArtworkType(artwork.category),
        imageUrl: artwork.image_url,
        likes: artwork.likes_count || 0,
        views: artwork.views_count || 0,
        price: artwork.price || 0,
        category: artwork.category,
        is_pinned: artwork.is_pinned || false,
        is_for_sale: artwork.is_for_sale || false,
        tags: artwork.tags || [],
        approval_status: artwork.approval_status || 'pending',
        created_at: artwork.created_at,
        description: artwork.description
      })) || [];
    } catch (err) {
      console.error('Error in fetchUserArtworks:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, [user]);

  return {
    artworks,
    loading,
    error,
    fetchArtworks,
    toggleLike,
    uploadArtwork,
    fetchUserArtworks
  };
};
