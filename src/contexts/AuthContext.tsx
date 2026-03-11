
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import LogoLoader from '@/components/ui/LogoLoader';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
  cover_url: string | null;
  tags: string[] | null;
  location: string | null;
  website: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: any | null;
  isPremium: boolean;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  signUp: (email: string, password: string, userData: { full_name: string; role: string; country?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const isPremium = subscription?.is_active === true && subscription?.subscription_tier === 'pro';

  // Fetch the current user's profile from the DB
  const refreshProfile = useCallback(async (userId?: string) => {
    const uid = userId;
    if (!uid) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, role, cover_url, tags, location, website')
        .eq('id', uid)
        .maybeSingle();
      if (data) setProfile(data as UserProfile);
    } catch { /* silent */ }
  }, []);
  useEffect(() => {
    // Fetch initial subscription
    const fetchSubscription = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();
        
        if (error) {
          return;
        }
        setSubscription(data);
      } catch (err) {
        // Silent failure for background subscription fetch
      }
    };

    let authListenerFired = false;

    // Set up auth state listener - MUST be synchronous to avoid deadlocks
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        authListenerFired = true;
        // Only synchronous state updates here
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          fetchSubscription(session.user.id);
          refreshProfile(session.user.id);
        } else {
          setSubscription(null);
          setProfile(null);
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if there's a pending signup role (from Google OAuth signup)
          const pendingRole = localStorage.getItem('pendingSignupRole');
          if (pendingRole) {
            // Clear the pending role immediately
            localStorage.removeItem('pendingSignupRole');
            
            // Defer Supabase calls with setTimeout to avoid deadlock
            setTimeout(() => {
              handleGoogleSignupProfile(session.user, pendingRole);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          // Clean up any stale pending signup role on sign out
          localStorage.removeItem('pendingSignupRole');
        }
      }
    );

    // Fallback: check for existing session only if onAuthStateChange hasn't fired yet
    // This handles the edge case where the page loads with an existing session
    const sessionTimeout = setTimeout(() => {
      if (!authListenerFired) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!authListenerFired) {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            if (session?.user) {
              fetchSubscription(session.user.id);
              refreshProfile(session.user.id);
            }
          }
        });
      }
    }, 100);

    return () => {
      clearTimeout(sessionTimeout);
      authSubscription.unsubscribe();
    };
  }, []);

  // Real-time subscription for subscription changes
  useEffect(() => {
    if (!user) return;

    const subChannel = supabase
      .channel(`user-subscription-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscribers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).is_active) {
            setSubscription(payload.new);
          } else {
            setSubscription(null);
          }
        }
      )
      .subscribe();

    // Real-time profile sync: avatar/bio/name updated in Settings propagates everywhere
    const profileChannel = supabase
      .channel(`user-profile-sync-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        () => refreshProfile(user.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user, refreshProfile]);

  // Handle Google signup profile creation - extracted to avoid async in callback
  const handleGoogleSignupProfile = async (user: User, pendingRole: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();
      
      if (existingProfile) {
        // Profile already exists — this is a returning Google user.
        // Don't overwrite their existing role with the pending role.
        return;
      }

      // No profile exists — this is a new Google OAuth signup. Create profile with selected role.
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          role: pendingRole,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
        });
        
      if (profileError) {
        console.error('Failed to create Google OAuth profile:', profileError);
        toast({
          title: "Profile Setup Issue",
          description: "Your account was created but we couldn't set up your profile. Please update your profile in settings.",
          variant: "destructive"
        });
      } else {
        // Refresh profile after creation
        refreshProfile(user.id);
      }
    } catch (error) {
      console.error('Error in handleGoogleSignupProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; role: string; country?: string }) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Supabase returns a fake success for existing users (security measure).
      // Detect this by checking if user.identities is empty or user already confirmed.
      const identities = data?.user?.identities;
      if (identities && identities.length === 0) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead, or use 'Forgot Password' to reset your password.",
          variant: "destructive"
        });
        return { error: { message: 'Account already exists' } };
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account."
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Signin error:', error);
        let errorMessage = error.message;
        
        // Provide user-friendly error messages
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        }
        
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in."
      });

      return { error: null, user: data.user };
    } catch (error: any) {
      console.error('Signin error:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error);
        return { error };
      }

      // Clear user and session state immediately
      setUser(null);
      setSession(null);

      toast({
        title: "Signed out",
        description: "You've been successfully signed out."
      });

      // Redirect to home page after logout
      window.location.href = '/';

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    subscription,
    isPremium,
    profile,
    refreshProfile,
    signUp,
    signIn,
    signOut,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {loading && <LogoLoader fullPage text="Loading Artswarit…" />}
      <div style={loading ? { visibility: 'hidden', overflow: 'hidden', height: 0 } : undefined}>
        {children}
      </div>
    </AuthContext.Provider>
  );
};
