
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import ExploreArtists from './pages/ExploreArtists';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
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
            <Route 
              path="/artist-dashboard" 
              element={
                <ProtectedRoute>
                  <ArtistDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/client-dashboard" 
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
