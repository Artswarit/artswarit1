
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import ScrollToTop from "./components/ScrollToTop";
import { useScrollAnchor } from "./hooks/useScrollAnchor";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
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

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore-artists" element={<ExploreArtists />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/review/:id" element={<ReviewRedirect />} />
        <Route path="/artwork/:id" element={<ArtworkDetails />} />
        <Route path="/artist-dashboard/:tab?" element={<ProtectedRoute><ArtistDashboard /></ProtectedRoute>} />
        <Route path="/client-dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/ai-detection" element={<AIDetection />} />
        <Route path="/feature-audit" element={<FeatureAudit />} />
        <Route path="/live-streaming" element={<LiveStreaming />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/commissions" element={<Commissions />} />
        <Route path="/events" element={<Events />} />
        <Route path="/merchandise" element={<Merchandise />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

const App = () => {
  useScrollAnchor("availability-calendar");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CurrencyProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <UniversalChatbot />
              <AppRoutes />
            </BrowserRouter>
          </CurrencyProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
