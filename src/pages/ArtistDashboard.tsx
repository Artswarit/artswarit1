
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import ApprovalPending from "@/components/auth/ApprovalPending";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ArtworkManagement from "@/components/dashboard/ArtworkManagement";
import ArtistProfile from "@/components/dashboard/ArtistProfile";
import ArtistEarnings from "@/components/dashboard/ArtistEarnings";
import ArtistNotifications from "@/components/dashboard/ArtistNotifications";
import ArtistSettings from "@/components/dashboard/ArtistSettings";
import ArtistPromotions from "@/components/dashboard/ArtistPromotions";
import ProjectRating from "@/components/dashboard/ProjectRating";
import AIContentDetection from "@/components/dashboard/AIContentDetection";

const ArtistDashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState(tab || "artworks");

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    navigate(`/artist-dashboard/${newTab}`);
  };

  // Show loading while checking auth/profile
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect non-authenticated users
  if (!user) {
    return null;
  }

  // Check if email is verified and account is approved
  if (!user.email_confirmed_at || (profile?.account_status && profile.account_status !== 'approved')) {
    return <ApprovalPending />;
  }

  // Only allow artists to access this dashboard
  if (profile?.role !== 'artist') {
    navigate('/client-dashboard');
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "artworks":
        return <ArtworkManagement />;
      case "profile":
        return <ArtistProfile />;
      case "earnings":
        return <ArtistEarnings />;
      case "notifications":
        return <ArtistNotifications />;
      case "settings":
        return <ArtistSettings />;
      case "promotions":
        return <ArtistPromotions />;
      case "rating":
        return <ProjectRating />;
      case "ai-detection":
        return <AIContentDetection />;
      default:
        return <ArtworkManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Artist Dashboard"
        subtitle="Manage your artworks, profile, and earnings"
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default ArtistDashboard;
