import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
  reason?: string;
  // Populated data
  blockedUserName?: string;
  blockedUserAvatar?: string;
}

export function useBlockedUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch blocked users
  const fetchBlockedUsers = useCallback(async () => {
    if (!user?.id) {
      setBlockedUsers([]);
      setBlockedUserIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_blocks')
        .select('*')
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = (data || []).map(b => b.blocked_id);
      setBlockedUserIds(new Set(userIds));

      // Enrich with user data
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const profileMap: Record<string, any> = {};
        (profiles || []).forEach(p => {
          if (p.id) profileMap[p.id] = p;
        });

        const enriched: BlockedUser[] = (data || []).map(block => {
          const profile = profileMap[block.blocked_id];
          return {
            id: block.id,
            blocked_id: block.blocked_id,
            created_at: block.created_at,
            reason: block.reason,
            blockedUserName: profile?.full_name,
            blockedUserAvatar: profile?.avatar_url,
          };
        });

        setBlockedUsers(enriched);
      } else {
        setBlockedUsers([]);
      }
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  // Check if a user is blocked
  const isUserBlocked = useCallback((userId: string) => {
    return blockedUserIds.has(userId);
  }, [blockedUserIds]);

  // Block a user
  const blockUser = useCallback(async (userId: string, reason?: string) => {
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to block users.",
      });
      return false;
    }

    if (userId === user.id) {
      toast({
        title: "Cannot block yourself",
        description: "You cannot block your own account.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: userId,
          reason,
        });

      if (error) throw error;

      setBlockedUserIds(prev => new Set(prev).add(userId));
      
      toast({
        title: "User blocked",
        description: "You will no longer see content from this user.",
      });

      fetchBlockedUsers();
      return true;
    } catch (err) {
      console.error('Error blocking user:', err);
      toast({
        title: "Error",
        description: "Failed to block user.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, toast, fetchBlockedUsers]);

  // Unblock a user
  const unblockUser = useCallback(async (userId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);

      if (error) throw error;

      setBlockedUserIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

      toast({
        title: "User unblocked",
        description: "You can now see content from this user.",
      });

      fetchBlockedUsers();
      return true;
    } catch (err) {
      console.error('Error unblocking user:', err);
      toast({
        title: "Error",
        description: "Failed to unblock user.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, toast, fetchBlockedUsers]);

  return {
    blockedUsers,
    blockedUserIds,
    loading,
    isUserBlocked,
    blockUser,
    unblockUser,
    refresh: fetchBlockedUsers,
  };
}
