import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
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
import { QueryClient } from './queryClient';
import ProtectedRoute from './components/ProtectedRoute';
import ExploreArtists from './pages/ExploreArtists';

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClient>
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
        </QueryClient>
      </AuthProvider>
    </Router>
  );
}

export default App;
