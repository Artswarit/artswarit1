
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateProfile = async (userId: string, updates: any) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'update_profile',
          data: { userId, updates }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      return { error: null };
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'reset_password',
          data: { email }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent"
      });

      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getUserStats = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'get_user_stats',
          data: { userId }
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Get user stats error:', error);
      return { data: null, error };
    }
  };

  const deleteAccount = async (userId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'delete_account',
          data: { userId }
        }
      });

      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted"
      });

      return { error: null };
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateProfile,
    resetPassword,
    getUserStats,
    deleteAccount
  };
};
