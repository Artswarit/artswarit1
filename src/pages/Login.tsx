
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoWithName from "@/components/LogoWithName";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useProfile } from "@/hooks/useProfile";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { user, signIn, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const [loginError, setLoginError] = useState<string | null>(null);

  // After successful login, fetch latest profile and redirect
  useEffect(() => {
    // Only redirect after all loading is complete, user exists, and either admin or profile loaded
    if (!loading && !adminLoading && !profileLoading && user) {
      if (isAdmin) {
        navigate("/admin-dashboard");
      } else if (profile?.role === "artist") {
        navigate("/artist-dashboard");
      } else {
        navigate("/client-dashboard");
      }
    }
    // eslint-disable-next-line
  }, [loading, adminLoading, profileLoading, user, isAdmin, profile, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);

    const { error } = await signIn(email, password);

    if (!error) {
      // Fetch latest profile just to be safe (sometimes the profile is not ready in time)
      refetchProfile && refetchProfile();
      // Redirection will happen automatically through the useEffect above when state updates
    } else {
      setLoginError(error.message || "Login failed");
    }
  };

  const handleGoogleSignin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setLoginError(error.message || "Google sign in failed");
    }
    // Redirect will happen automatically via auth state changes
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <LogoWithName />
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-gray-900 my-[26px]">
              Log in to your account
            </h1>
            <p className="mt-2 text-sm text-gray-600 my-0 mx-0">
              Or{" "}
              <Link to="/signup" className="font-medium text-artswarit-purple hover:text-artswarit-purple-dark">
                create a new account
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="mt-1"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="mt-1"
                  disabled={loading}
                />
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-sm font-medium text-artswarit-purple hover:text-artswarit-purple-dark">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={checked => setRememberMe(checked === true)}
                  disabled={loading}
                />
                <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
              </div>
            </div>
            {loginError && (
              <div className="text-red-600 text-center text-sm">{loginError}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </Button>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-3 text-sm text-gray-500">Or continue with</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={handleGoogleSignin}
                type="button"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="mr-2">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="mr-2">
                  <linearGradient id="Ld6sqrtcxMyckEl6xeDdMa" x1="9.993" x2="40.615" y1="9.993" y2="40.615" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#2aa4f4" />
                    <stop offset="1" stopColor="#007ad9" />
                  </linearGradient>
                  <path fill="url(#Ld6sqrtcxMyckEl6xeDdMa)" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z" />
                  <path fill="#fff" d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-2.184,0.714-4.121,2.757-4.121h3.283V12.46 c-0.577-0.078-1.797-0.248-4.102-0.248c-4.814,0-7.636,2.542-7.636,8.334v3.498H16.06v5.258h4.948v14.452 C21.988,43.9,22.981,44,24,44c0.921,0,1.82-0.084,2.707-0.204V29.301z" />
                </svg>
                Facebook
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;

