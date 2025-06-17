
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
        <main className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 pt-20 sm:pt-24">
          <DashboardHeader 
            user={user} 
            profile={profile}
            title="Artist Dashboard"
            subtitle="Manage your artworks, projects, profile, and earnings"
          />

          <Tabs defaultValue={defaultTab} className="w-full">
            {/* Enhanced mobile-first tabs */}
            <div className="w-full mb-6 sm:mb-8">
              <TabsList className="grid grid-cols-4 sm:grid-cols-8 w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1 gap-1">
                <TabsTrigger 
                  value="artworks" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1 sm:px-3 py-2 sm:py-2 min-h-[60px] sm:min-h-[44px] rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <Palette className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="leading-tight">Artworks</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="projects" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1 sm:px-3 py-2 sm:py-2 min-h-[60px] sm:min-h-[44px] rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <Briefcase className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="leading-tight">Projects</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1 sm:px-3 py-2 sm:py-2 min-h-[60px] sm:min-h-[44px] rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <User className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="leading-tight">Profile</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="premium" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1 sm:px-3 py-2 sm:py-2 min-h-[60px] sm:min-h-[44px] rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <Crown className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="leading-tight">Premium</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="earnings" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1 sm:px-3 py-2 sm:py-2 min-h-[60px] sm:min-h-[44px] rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <DollarSign className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="leading-tight">Earnings</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1 sm:px-3 py-2 sm:py-2 min-h-[60px] sm:min-h-[44px] rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <MessageSquare className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="leading-tight">Messages</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1 sm:px-3 py-2 sm:py-2 min-h-[60px] sm:min-h-[44px] rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <Bell className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="leading-tight">Alerts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1 sm:px-3 py-2 sm:py-2 min-h-[60px] sm:min-h-[44px] rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <Settings className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="leading-tight">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="artworks" className="space-y-6">
              <ArtworkManagement />
            </TabsContent>
            <TabsContent value="projects" className="space-y-6">
              <ProjectManagement />
            </TabsContent>
            <TabsContent value="profile" className="space-y-6">
              <ArtistProfile isLoading={profileLoading} />
            </TabsContent>
            <TabsContent value="premium" className="space-y-6">
              <PremiumMembership />
            </TabsContent>
            <TabsContent value="earnings" className="space-y-6">
              <ArtistEarnings isLoading={profileLoading} />
            </TabsContent>
            <TabsContent value="messages" className="space-y-6">
              <MessagingModule />
            </TabsContent>
            <TabsContent value="notifications" className="space-y-6">
              <ArtistNotifications isLoading={profileLoading} />
            </TabsContent>
            <TabsContent value="settings" className="space-y-6">
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
