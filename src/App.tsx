
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Explore from '@/pages/Explore';
import ExploreArtists from '@/pages/ExploreArtists';
import Pricing from '@/pages/Pricing';
import Contact from '@/pages/Contact';
import ArtistDashboard from '@/pages/ArtistDashboard';
import ClientDashboard from '@/pages/ClientDashboard';
import ArtistProfile from '@/pages/ArtistProfile';
import ArtworkDetails from '@/pages/ArtworkDetails';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import BackendTest from "@/pages/BackendTest";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/artists" element={<ExploreArtists />} />
              <Route path="/explore-artists" element={<ExploreArtists />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/artist-dashboard" element={<ArtistDashboard />} />
              <Route path="/artist-dashboard/:tab" element={<ArtistDashboard />} />
              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/artist/:id" element={<ArtistProfile />} />
              <Route path="/artwork/:id" element={<ArtworkDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/backend-test" element={<BackendTest />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
