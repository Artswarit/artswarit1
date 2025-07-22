
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (retryCount = 0) => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching profile for user:', user.id);

      // Add timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .abortSignal(controller.signal)
        .maybeSingle();

      clearTimeout(timeoutId);

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        
        // Retry logic for network errors
        if (retryCount < 2 && (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('network'))) {
          console.log(`Retrying profile fetch (attempt ${retryCount + 1})`);
          setTimeout(() => fetchProfile(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        setError(fetchError.message);
        toast({
          title: "Profile Error",
          description: "Failed to load profile data. Please try refreshing the page.",
          variant: "destructive"
        });
        return;
      }

      if (!data) {
        console.log('No profile found, creating default profile');
        // Create a default profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            role: user.user_metadata?.role || 'client',
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setError(createError.message);
          return;
        }

        setProfile(newProfile);
      } else {
        console.log('Profile data loaded successfully:', data);
        setProfile(data);
      }
    } catch (err: any) {
      console.error('Error in fetchProfile:', err);
      
      // Handle network errors specifically
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your internet connection.');
      } else if (retryCount < 2) {
        console.log(`Retrying profile fetch due to error (attempt ${retryCount + 1})`);
        setTimeout(() => fetchProfile(retryCount + 1), 1000 * (retryCount + 1));
        return;
      } else {
        setError(err.message || 'Network error occurred');
      }
      
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      console.error('No user logged in');
      return { error: 'No user logged in' };
    }

    try {
      console.log('Updating profile with:', updates);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast({
          title: "Update failed",
          description: updateError.message,
          variant: "destructive"
        });
        return { error: updateError };
      }

      // Refresh profile data
      await fetchProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });

      return { error: null };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive"
      });
      return { error: err.message };
    }
  };

  const getProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        return null;
      }

      return data;
    } catch (err: any) {
      console.error('Error in getProfile:', err);
      return null;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
    getProfile
  };
};
