
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ArtworkManagement from '@/components/dashboard/ArtworkManagement';
import ArtistProfile from '@/components/dashboard/ArtistProfile';
import ArtistEarnings from '@/components/dashboard/ArtistEarnings';
import MessagingModule from '@/components/dashboard/messages/MessagingModule';
import ArtistSettings from '@/components/dashboard/ArtistSettings';
import PremiumMembership from '@/components/premium/PremiumMembership';
import ProjectManagement from '@/components/dashboard/projects/ProjectManagement';
import ArtistNotifications from '@/components/dashboard/ArtistNotifications';
import UniversalChatbot from '@/components/UniversalChatbot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, User, DollarSign, MessageSquare, Settings, Crown, Bell, Briefcase } from 'lucide-react';

const ArtistDashboard = () => {
  const { tab } = useParams();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  // Redirect non-artists to client dashboard
  useEffect(() => {
    if (profile && profile.role !== 'artist' && profile.role !== 'premium') {
      window.location.href = '/client-dashboard';
    }
  }, [profile]);

  const defaultTab = tab || 'artworks';

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto mobile-padding py-4 sm:py-6 lg:py-8 pt-20 sm:pt-24">
          <DashboardHeader 
            user={user} 
            profile={profile}
            title="Artist Dashboard"
            subtitle="Manage your artworks, projects, profile, and earnings"
          />

          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="overflow-x-auto mb-6 sm:mb-8">
              <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 mb-6 sm:mb-8 bg-white/50 backdrop-blur-sm min-w-max sm:min-w-0">
                <TabsTrigger value="artworks" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Artworks</span>
                  <span className="sm:hidden">Art</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Projects</span>
                  <span className="sm:hidden">Proj</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Profile</span>
                  <span className="sm:hidden">Prof</span>
                </TabsTrigger>
                <TabsTrigger value="premium" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Premium</span>
                  <span className="sm:hidden">Prem</span>
                </TabsTrigger>
                <TabsTrigger value="earnings" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Earnings</span>
                  <span className="sm:hidden">Earn</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Messages</span>
                  <span className="sm:hidden">Msg</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                  <span className="sm:hidden">Not</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Set</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="artworks" className="space-y-4 sm:space-y-6">
              <ArtworkManagement />
            </TabsContent>
            <TabsContent value="projects" className="space-y-4 sm:space-y-6">
              <ProjectManagement />
            </TabsContent>
            <TabsContent value="profile" className="space-y-4 sm:space-y-6">
              <ArtistProfile isLoading={profileLoading} />
            </TabsContent>
            <TabsContent value="premium" className="space-y-4 sm:space-y-6">
              <PremiumMembership />
            </TabsContent>
            <TabsContent value="earnings" className="space-y-4 sm:space-y-6">
              <ArtistEarnings isLoading={profileLoading} />
            </TabsContent>
            <TabsContent value="messages" className="space-y-4 sm:space-y-6">
              <MessagingModule />
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
              <ArtistNotifications isLoading={profileLoading} />
            </TabsContent>
            <TabsContent value="settings" className="space-y-4 sm:space-y-6">
              <ArtistSettings isLoading={profileLoading} />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
        <UniversalChatbot />
      </div>
    </ProtectedRoute>
  );
};

export default ArtistDashboard;
