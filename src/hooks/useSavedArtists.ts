import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSavedArtists = () => {
  const [savedArtists, setSavedArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSavedArtists = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_artists')
        .select(`
          *,
          artist:profiles!saved_artists_artist_id_fkey(
            id,
            full_name,
            avatar_url,
            bio,
            role
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedArtists(data || []);
    } catch (error: any) {
      console.error('Error fetching saved artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveArtist = async (artistId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save artists",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Check if already saved
      const { data: existing } = await supabase
        .from('saved_artists')
        .select('id')
        .eq('client_id', user.id)
        .eq('artist_id', artistId)
        .single();

      if (existing) {
        // Unsave
        const { error } = await supabase
          .from('saved_artists')
          .delete()
          .eq('client_id', user.id)
          .eq('artist_id', artistId);

        if (error) throw error;

        toast({
          title: "Artist removed",
          description: "Artist removed from your saved list"
        });
        return false;
      } else {
        // Save
        const { error } = await supabase
          .from('saved_artists')
          .insert({
            client_id: user.id,
            artist_id: artistId
          });

        if (error) throw error;

        toast({
          title: "Artist saved",
          description: "Artist added to your saved list"
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error toggling save artist:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      await fetchSavedArtists();
    }
  };

  const isSaved = async (artistId: string) => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .from('saved_artists')
        .select('id')
        .eq('client_id', user.id)
        .eq('artist_id', artistId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedArtists();
    }
  }, [user]);

  return {
    savedArtists,
    loading,
    toggleSaveArtist,
    isSaved,
    refetch: fetchSavedArtists
  };
};