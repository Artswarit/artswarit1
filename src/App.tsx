
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import { useScrollAnchor } from "./hooks/useScrollAnchor";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { TopLoadingBar } from "./components/TopLoadingBar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UniversalChatbot from "./components/UniversalChatbot";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./pages/EmailVerification";
import Explore from "./pages/Explore";
import ExploreArtists from "./pages/ExploreArtists";
import Categories from "./pages/Categories";
import ArtistProfile from "./pages/ArtistProfile";
import UserProfile from "./pages/UserProfile";
import ArtworkDetails from "./pages/ArtworkDetails";
import ReviewRedirect from "./pages/ReviewRedirect";
import ArtistDashboard from "./pages/ArtistDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AboutUs from "./pages/AboutUs";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";
import AIDetection from "./pages/AIDetection";
import FeatureAudit from "./pages/FeatureAudit";
import LiveStreaming from "./pages/LiveStreaming";
import Collections from "./pages/Collections";
import Trending from "./pages/Trending";
import Recommendations from "./pages/Recommendations";
import Commissions from "./pages/Commissions";
import Events from "./pages/Events";
import Merchandise from "./pages/Merchandise";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Prevent redundant refetching on window focus
      refetchOnReconnect: true,
    },
  },
});

// Application routes component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, errorMessage: error instanceof Error ? error.message : 'Unknown error' };
  }
  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-6xl">⚠️</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                {this.state.errorMessage || 'An unexpected error occurred in this part of the application.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={state?.backgroundLocation || location} key={(state?.backgroundLocation || location).pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/verify-email" element={<PageTransition><EmailVerification /></PageTransition>} />
          <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
          <Route path="/explore-artists" element={<PageTransition><ExploreArtists /></PageTransition>} />
          <Route path="/categories" element={<PageTransition><Categories /></PageTransition>} />
          <Route path="/artist/:id" element={<PageTransition><ArtistProfile /></PageTransition>} />
          <Route path="/profile/:id" element={<PageTransition><UserProfile /></PageTransition>} />
          <Route path="/review/:id" element={<PageTransition><ReviewRedirect /></PageTransition>} />
          <Route path="/artwork/:id" element={<PageTransition><ArtworkDetails /></PageTransition>} />
          <Route path="/artist-dashboard/:tab?" element={<ProtectedRoute><PageTransition><ArtistDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/client-dashboard" element={<ProtectedRoute><PageTransition><ClientDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute adminOnly><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/about-us" element={<PageTransition><AboutUs /></PageTransition>} />
          <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
          <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/refund-policy" element={<PageTransition><RefundPolicy /></PageTransition>} />
          <Route path="/contact-us" element={<PageTransition><ContactUs /></PageTransition>} />
          <Route path="/ai-detection" element={<PageTransition><AIDetection /></PageTransition>} />
          <Route path="/feature-audit" element={<PageTransition><FeatureAudit /></PageTransition>} />
          <Route path="/live-streaming" element={<PageTransition><LiveStreaming /></PageTransition>} />
          <Route path="/collections" element={<PageTransition><Collections /></PageTransition>} />
          <Route path="/trending" element={<PageTransition><Trending /></PageTransition>} />
          <Route path="/recommendations" element={<PageTransition><Recommendations /></PageTransition>} />
          <Route path="/commissions" element={<PageTransition><Commissions /></PageTransition>} />
          <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
          <Route path="/merchandise" element={<PageTransition><Merchandise /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>

      {/* Modal Routes */}
      {state?.backgroundLocation && (
        <Routes>
          <Route 
            path="/artwork/:id" 
            element={
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                  <ArtworkDetails isModal={true} />
                </div>
              </div>
            } 
          />
          <Route 
            path="/login" 
            element={
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-background rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                  <Login isModal={true} />
                </div>
              </div>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-background rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                  <Signup isModal={true} />
                </div>
              </div>
            } 
          />
        </Routes>
      )}
    </ErrorBoundary>
  );
};

const App = () => {
  useScrollAnchor("availability-calendar");
  return (
    <BrowserRouter>
      <TopLoadingBar />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CurrencyProvider>
              <Toaster />
              <Sonner />
              <ScrollToTop />
              <UniversalChatbot />
              <AppRoutes />
            </CurrencyProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
