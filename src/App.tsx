
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmailVerification from "./pages/EmailVerification";
import Explore from "./pages/Explore";
import ExploreArtists from "./pages/ExploreArtists";
import Categories from "./pages/Categories";
import ArtistProfile from "./pages/ArtistProfile";
import ArtworkDetails from "./pages/ArtworkDetails";
import ArtistDashboard from "./pages/ArtistDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AboutUs from "./pages/AboutUs";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/explore-artists" element={<ExploreArtists />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/artist/:id" element={<ArtistProfile />} />
                <Route path="/artwork/:id" element={<ArtworkDetails />} />
                <Route path="/artist-dashboard" element={<ArtistDashboard />} />
                <Route path="/artist-dashboard/:tab" element={<ArtistDashboard />} />
                <Route path="/client-dashboard" element={<ClientDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
