
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import Categories from "./pages/Categories";
import ArtistProfile from "./pages/ArtistProfile";
import ClientDashboard from "./pages/ClientDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import NotFound from "./pages/NotFound";
import AIDetection from "./pages/AIDetection";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/artist/:id" element={<ArtistProfile />} />
                <Route path="/client-dashboard" element={<ClientDashboard />} />
                <Route path="/artist-dashboard" element={<ArtistDashboard />} />
                <Route path="/artist-dashboard/:tab" element={<ArtistDashboard />} />
                <Route path="/artist-dashboard/upload" element={<ArtistDashboard />} />
                <Route path="/ai-detection" element={<AIDetection />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
