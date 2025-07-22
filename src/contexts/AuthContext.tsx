
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { full_name: string; role: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: any }>;
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
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email);
          
          // Check if user needs email verification
          if (!session.user.email_confirmed_at) {
            toast({
              title: "Email verification required",
              description: "Please check your email and click the verification link.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Welcome back!",
              description: "You've successfully signed in.",
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          toast({
            title: "Signed out",
            description: "You've been successfully signed out.",
          });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
          if (session?.user?.email_confirmed_at) {
            toast({
              title: "Email verified!",
              description: "Your email has been successfully verified.",
            });
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [toast]);

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
      } else {
        console.log('Session refreshed successfully');
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; role: string }) => {
    try {
      setLoading(true);
      console.log('Attempting signup for:', email);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        console.error('Signup error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('email')) {
          errorMessage = 'Please enter a valid email address.';
        }
        
        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive"
        });
        return { error };
      }

      console.log('Signup successful:', data);
      
      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to verify your account.",
        });
      } else {
        toast({
          title: "Account created successfully!",
          description: "Welcome to Artswarit!"
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting signin for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Signin error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
        }
        
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive"
        });
        return { error };
      }

      console.log('Signin successful:', data.user?.email);
      
      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Email verification required",
          description: "Please verify your email before accessing your account.",
          variant: "destructive"
        });
        return { error: { message: 'Email not verified' } };
      }
      
      return { error: null };
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
      console.log('Attempting signout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      console.log('Signout successful');
      return { error: null };
    } catch (error: any) {
      console.error('Signout error:', error);
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Attempting Google signin');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Google signin error:', error);
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      console.log('Google signin initiated');
      return { error: null };
    } catch (error: any) {
      console.error('Google signin error:', error);
      toast({
        title: "Google sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      console.log('Resending verification email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Resend verification error:', error);
        toast({
          title: "Failed to resend verification",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast({
        title: "Failed to resend verification",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    refreshSession,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
