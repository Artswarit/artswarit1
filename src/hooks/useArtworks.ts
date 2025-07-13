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

  // Mock data as fallback
  const mockArtworks = [
    {
      id: "1",
      title: "Midnight Symphony",
      artist: "Alex Rivera",
      artistId: "1",
      artist_id: "1",
      type: "music",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 1250,
      views: 8900,
      price: 50,
      category: "Music",
      audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav",
      is_pinned: false,
      is_for_sale: true,
      tags: ["ambient", "electronic", "chill"],
      approval_status: "approved",
      created_at: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      title: "Digital Dreamscape",
      artist: "Maya Johnson",
      artistId: "2",
      artist_id: "2",
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 2100,
      views: 45000,
      price: 150,
      category: "Digital Art",
      is_pinned: true,
      is_for_sale: true,
      tags: ["digital", "surreal", "colorful"],
      approval_status: "pending",
      created_at: "2024-02-20T14:15:00Z"
    },
    {
      id: "3",
      title: "Street Philosophy",
      artist: "Jordan Smith",
      artistId: "3",
      artist_id: "3",
      type: "music",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 890,
      views: 12000,
      price: 25,
      category: "Hip-Hop",
      audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav",
      is_pinned: false,
      is_for_sale: true,
      tags: ["hip-hop", "conscious", "urban"],
      approval_status: "rejected",
      created_at: "2024-01-08T09:45:00Z"
    },
    {
      id: "4",
      title: "Urban Vibes",
      artist: "Alex Rivera",
      artistId: "1",
      artist_id: "1",
      type: "video",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 3200,
      views: 78000,
      price: 200,
      category: "Music Video",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      is_pinned: false,
      is_for_sale: true,
      tags: ["music video", "urban", "street"],
      approval_status: "approved",
      created_at: "2024-03-12T16:20:00Z"
    },
    {
      id: "5",
      title: "Abstract Emotions",
      artist: "Maya Johnson",
      artistId: "2",
      artist_id: "2",
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 1580,
      views: 23400,
      price: 120,
      category: "Abstract Art",
      is_pinned: false,
      is_for_sale: true,
      tags: ["abstract", "emotional", "expressive"],
      approval_status: "approved",
      created_at: "2024-02-05T11:30:00Z"
    },
    {
      id: "6",
      title: "Conscious Flow",
      artist: "Jordan Smith",
      artistId: "3",
      artist_id: "3",
      type: "music",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 945,
      views: 15600,
      price: 30,
      category: "Conscious Rap",
      audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav",
      is_pinned: false,
      is_for_sale: true,
      tags: ["conscious rap", "lyrical", "meaningful"],
      approval_status: "pending",
      created_at: "2024-01-28T13:45:00Z"
    },
    {
      id: "7",
      title: "Ocean Waves",
      artist: "Serena Blue",
      artistId: "4",
      artist_id: "4",
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 2800,
      views: 35000,
      price: 180,
      category: "Landscape",
      is_pinned: true,
      is_for_sale: true,
      tags: ["nature", "ocean", "peaceful"],
      approval_status: "approved",
      created_at: "2024-03-01T08:15:00Z"
    },
    {
      id: "8",
      title: "City Lights",
      artist: "Marcus Tech",
      artistId: "5",
      artist_id: "5",
      type: "video",
      imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      likes: 1900,
      views: 28000,
      price: 300,
      category: "Urban",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      is_pinned: false,
      is_for_sale: true,
      tags: ["urban", "night", "timelapse"],
      approval_status: "approved",
      created_at: "2024-02-18T19:30:00Z"
    }
  ];

  const fetchArtworks = async () => {
    console.log('Fetching artworks from Supabase...');
    setLoading(true);
    
    try {
      const { data: dbArtworks, error: fetchError } = await supabase
        .from('artworks')
        .select(`
          *,
          profiles!artworks_artist_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching artworks:', fetchError);
        setError(fetchError.message);
        // Use mock data as fallback
        setArtworks(mockArtworks);
      } else {
        console.log('Fetched artworks from DB:', dbArtworks);
        
        // Transform database artworks to match the expected format
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

        // Combine database artworks with mock data for demo purposes
        const combinedArtworks = [...transformedArtworks, ...mockArtworks];
        console.log('Combined artworks:', combinedArtworks.length);
        setArtworks(combinedArtworks);
      }
    } catch (err) {
      console.error('Error in fetchArtworks:', err);
      setError('Failed to fetch artworks');
      setArtworks(mockArtworks);
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
        .upload(`${user.id}/${fileName}`, file);

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
      let imageUrl = null;
      
      // Handle file upload if present
      if (artworkData.file) {
        const fileName = `${Date.now()}-${artworkData.file.name}`;
        imageUrl = await uploadToStorage(artworkData.file, fileName);
        console.log('File uploaded to storage:', imageUrl);
      }

      // Prepare artwork data for database
      const dbArtworkData = {
        title: artworkData.title,
        description: artworkData.description || null,
        category: artworkData.category,
        tags: artworkData.tags || [],
        price: artworkData.price || null,
        is_for_sale: artworkData.is_for_sale || false,
        is_pinned: artworkData.is_pinned || false,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        artist_id: user.id,
        approval_status: 'approved', // Auto-approve for beta
        release_date: artworkData.release_date || null
      };

      console.log('Inserting artwork to database:', dbArtworkData);

      const { data: newArtwork, error: insertError } = await supabase
        .from('artworks')
        .insert([dbArtworkData])
        .select(`
          *,
          profiles!artworks_artist_id_fkey(full_name)
        `)
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      console.log('Artwork successfully uploaded to database:', newArtwork);

      // Transform the new artwork to match our format
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

      // Update local state to include the new artwork
      setArtworks(prevArtworks => [transformedArtwork, ...prevArtworks]);

      toast({
        title: "Success",
        description: "Artwork uploaded successfully and is now visible on your profile and explore page!",
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
      // Check if user already liked this artwork
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
        // Unlike - remove the like
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
        // Like - add new like
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

      // Refresh artworks to update like counts
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

  useEffect(() => {
    fetchArtworks();
  }, [user]);

  return {
    artworks,
    loading,
    error,
    fetchArtworks,
    toggleLike,
    uploadArtwork
  };
};
