
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLogging } from '@/components/logging/LoggingProvider';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  social_links: any;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logAndTrack } = useLogging();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const startTime = performance.now();
    try {
      setLoading(true);
      setError(null);

      await logAndTrack('fetchProfile', 'useProfile', 'profile_fetch_start', {
        user_id: user.id
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
        
        const executionTime = performance.now() - startTime;
        await logAndTrack('fetchProfile', 'useProfile', 'profile_fetch_error',
          { user_id: user.id },
          { error: error.message, execution_time_ms: executionTime },
          error as Error
        );
        return;
      }

      if (!data) {
        console.log('No profile found for user, they may need to complete signup');
        setProfile(null);
        return;
      }

      setProfile(data);
      
      const executionTime = performance.now() - startTime;
      await logAndTrack('fetchProfile', 'useProfile', 'profile_fetch_success',
        { user_id: user.id },
        { profile_found: true, execution_time_ms: executionTime }
      );
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      
      await logAndTrack('fetchProfile', 'useProfile', 'profile_fetch_exception',
        { user_id: user?.id },
        { error: err.message },
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    const startTime = performance.now();
    try {
      await logAndTrack('updateProfile', 'ArtistProfile', 'profile_update_start', {
        user_id: user.id,
        fields_updated: Object.keys(updates)
      });

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive"
        });
        
        const executionTime = performance.now() - startTime;
        await logAndTrack('updateProfile', 'ArtistProfile', 'profile_update_error',
          { user_id: user.id },
          { error: error.message, execution_time_ms: executionTime },
          error as Error
        );
        return { error };
      }

      // Refresh profile data
      await fetchProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });

      const executionTime = performance.now() - startTime;
      await logAndTrack('updateProfile', 'ArtistProfile', 'profile_update_success',
        { user_id: user.id },
        { updates, execution_time_ms: executionTime }
      );

      return { error: null };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      
      await logAndTrack('updateProfile', 'ArtistProfile', 'profile_update_exception',
        { user_id: user.id },
        { error: err.message },
        err
      );
      return { error: err.message };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};
