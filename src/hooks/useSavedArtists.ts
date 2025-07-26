import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSavedArtists = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedArtists, setSavedArtists] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSavedArtists();
    }
  }, [user]);

  const fetchSavedArtists = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('saved_artists')
        .select('artist_id')
        .eq('client_id', user.id);

      if (error) throw error;

      setSavedArtists(data.map(item => item.artist_id));
    } catch (error) {
      console.error('Error fetching saved artists:', error);
    }
  };

  const toggleSaveArtist = async (artistId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save artists.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const isSaved = savedArtists.includes(artistId);

      if (isSaved) {
        // Remove from saved
        await supabase
          .from('saved_artists')
          .delete()
          .eq('client_id', user.id)
          .eq('artist_id', artistId);

        setSavedArtists(prev => prev.filter(id => id !== artistId));
        
        toast({
          title: "Artist Removed",
          description: "Artist removed from your saved list.",
        });
      } else {
        // Add to saved
        await supabase
          .from('saved_artists')
          .insert({
            client_id: user.id,
            artist_id: artistId
          });

        setSavedArtists(prev => [...prev, artistId]);
        
        toast({
          title: "Artist Saved",
          description: "Artist added to your saved list.",
        });
      }
    } catch (error) {
      console.error('Error toggling saved artist:', error);
      toast({
        title: "Error",
        description: "Failed to update saved artists.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSaved = (artistId: string) => savedArtists.includes(artistId);

  return {
    savedArtists,
    isSaved,
    toggleSaveArtist,
    loading
  };
};