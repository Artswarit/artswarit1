
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Explore from './pages/Explore';
import Categories from './pages/Categories';
import AIDetection from './pages/AIDetection';
import ArtistProfile from './pages/ArtistProfile';
import ArtistDashboard from './pages/ArtistDashboard';
import ClientDashboard from './pages/ClientDashboard';
import NotFound from './pages/NotFound';
import { QueryClientProvider } from './queryClient';
import ProtectedRoute from './components/ProtectedRoute';
import ExploreArtists from './pages/ExploreArtists';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore-artists" element={<ExploreArtists />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/ai-detection" element={<AIDetection />} />
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            {/* Temporarily remove protection for testing */}
            <Route path="/artist-dashboard" element={<ArtistDashboard />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
