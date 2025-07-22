import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Artworks from '@/pages/Artworks';
import Artists from '@/pages/Artists';
import Pricing from '@/pages/Pricing';
import Contact from '@/pages/Contact';
import Dashboard from '@/pages/Dashboard';
import ProfilePage from '@/pages/ProfilePage';
import ArtworkDetail from '@/pages/ArtworkDetail';
import UniversalChatbot from '@/components/UniversalChatbot';
import BackendTest from "@/pages/BackendTest";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/artworks" element={<Artworks />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/artwork/:id" element={<ArtworkDetail />} />
              <Route path="/backend-test" element={<BackendTest />} />
            </Routes>
            <Footer />
            <Toaster />
            <UniversalChatbot />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
