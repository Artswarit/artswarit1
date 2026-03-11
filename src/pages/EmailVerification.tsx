import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LogoWithName from "@/components/LogoWithName";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";

const EmailVerification = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check if user is verified
    if (user?.email_confirmed_at) {
      setIsVerified(true);
      // Redirect to appropriate dashboard after 2 seconds
      setTimeout(() => {
        redirectToDashboard();
      }, 2000);
    }
  }, [user]);

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    // Listen for auth state changes to detect email verification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'USER_UPDATED' && session?.user?.email_confirmed_at) {
        setIsVerified(true);
        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified.",
        });
        setTimeout(() => {
          redirectToDashboard();
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const redirectToDashboard = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'artist' || profile?.role === 'premium') {
        navigate('/artist-dashboard');
      } else if (profile?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/client-dashboard');
      }
    } catch (error) {
      navigate('/');
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Resend verification error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification email sent!",
          description: "Please check your inbox for the verification link.",
        });
        setCooldown(60); // 60 second cooldown
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshStatus = async () => {
    const { data: { user: refreshedUser } } = await supabase.auth.getUser();
    if (refreshedUser?.email_confirmed_at) {
      setIsVerified(true);
      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified.",
      });
      setTimeout(() => {
        redirectToDashboard();
      }, 2000);
    } else {
      toast({
        title: "Not yet verified",
        description: "Please check your email and click the verification link.",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="glass-card border-0 shadow-xl max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please log in to verify your email.</p>
              <Button asChild className="mt-4">
                <Link to="/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-[80px]">
        <div className="w-full max-w-sm sm:max-w-md space-y-6">
          <div className="text-center">
            <LogoWithName />
          </div>

          <Card className="glass-card border-0 shadow-xl">
            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="text-xl sm:text-2xl text-center font-heading">
                {isVerified ? "Email Verified!" : "Verify Your Email"}
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                {isVerified 
                  ? "Your email has been verified. Redirecting..."
                  : "Please verify your email to continue"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isVerified ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your email has been successfully verified. 
                    Redirecting you to your dashboard...
                  </p>
                  <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-artswarit-purple" />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm">
                      We've sent a verification email to:
                    </p>
                    <p className="font-medium text-foreground">
                      {user.email}
                    </p>
                  </div>

                  <p className="text-muted-foreground text-xs">
                    Please check your inbox and click the verification link to activate your account.
                    Don't forget to check your spam folder!
                  </p>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      onClick={handleResendVerification}
                      disabled={isResending || cooldown > 0}
                      className="w-full h-11 bg-gradient-to-r from-artswarit-purple to-blue-500 hover:from-artswarit-purple-dark hover:to-blue-600 text-white font-medium"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : cooldown > 0 ? (
                        `Resend in ${cooldown}s`
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Verification Email
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleRefreshStatus}
                      className="w-full h-11"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      I've Verified, Check Status
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-artswarit-purple hover:text-artswarit-purple-dark"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmailVerification;
