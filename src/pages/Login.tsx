
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LogoWithName from "@/components/LogoWithName";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Login = ({ isModal = false }: { isModal?: boolean }) => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, loading, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      redirectBasedOnRole();
    }
  }, [user, loading, navigate]);

  const redirectBasedOnRole = async () => {
    if (!user) return;
    setIsRedirecting(true);
    
    try {
      // Check both profile role AND user_roles table for admin status
      const [profileResult, adminResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('role, full_name, bio, avatar_url, tags')
          .eq('id', user.id)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle(),
      ]);

      if (profileResult.error) {
        console.error('Error fetching profile for redirect:', profileResult.error);
        navigate('/');
        return;
      }

      const profile = profileResult.data;
      const isAdmin = profile?.role === 'admin' || adminResult.data?.role === 'admin';

      // Admin users always go to admin dashboard
      if (isAdmin) {
        navigate('/admin-dashboard');
      } else if (profile?.role === 'artist' || profile?.role === 'premium') {
        navigate('/artist-dashboard');
      } else {
        navigate('/client-dashboard');
      }
    } catch (error) {
      console.error('Error in redirectBasedOnRole:', error);
      navigate('/');
    } finally {
      setIsRedirecting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      // Role-based redirect will happen via useEffect when user state updates
    }
    
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    // Google OAuth works for both existing and new users.
    // Existing users: Supabase auto-links to their account by email.
    // New users: If no pendingSignupRole, they'll get assigned 'client' default.
    // New users who want a specific role should sign up via the Signup page.
    setIsSubmitting(true);
    await signInWithGoogle();
    setIsSubmitting(false);
  };

  return (
    <div className={cn("min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50", isModal && "min-h-0 bg-none")}>
      {!isModal && <Navbar />}
      
      {isModal && (
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className={cn("flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8", isModal ? "py-6" : "py-[80px]")}>
        <div className="w-full max-w-sm sm:max-w-md space-y-4">
          <div className="text-center space-y-0">
            <LogoWithName />
          </div>

          <Card className="glass-card border-0 shadow-xl">
            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="text-xl sm:text-2xl text-center font-heading">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                Sign in to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 text-base pr-12"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-artswarit-purple to-blue-500 hover:from-artswarit-purple-dark hover:to-blue-600 text-white font-medium"
                  disabled={loading || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading || isSubmitting}
                className="w-full h-11 border-gray-300 hover:bg-gray-50"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="flex flex-col gap-2 text-center text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-muted-foreground hover:text-artswarit-purple transition-colors"
                >
                  Forgot your password?
                </Link>
                <div>
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link
                    to="/signup"
                    className="font-medium text-artswarit-purple hover:text-artswarit-purple-dark"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {!isModal && <Footer />}
    </div>
  );
};

export default Login;
