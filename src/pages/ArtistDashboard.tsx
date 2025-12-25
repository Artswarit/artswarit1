import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import ApprovalPending from '@/components/auth/ApprovalPending';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ArtworkManagement from '@/components/dashboard/ArtworkManagement';
import ArtistProfile from '@/components/dashboard/ArtistProfile';
import ArtistEarnings from '@/components/dashboard/ArtistEarnings';
import MessagingModule from '@/components/dashboard/messages/MessagingModule';
import ArtistSettings from '@/components/dashboard/ArtistSettings';
import PremiumMembership from '@/components/premium/PremiumMembership';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, User, DollarSign, MessageSquare, Settings, Crown, Bell, Briefcase, Wrench } from 'lucide-react';
import ArtworkUpload from '@/components/artwork/ArtworkUpload';
import ProjectManagement from '@/components/dashboard/projects/ProjectManagement';
import ArtistNotifications from '@/components/dashboard/ArtistNotifications';
import ServicesManagement from '@/components/dashboard/services/ServicesManagement';
import UniversalChatbot from '@/components/UniversalChatbot';

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
        <main className="container sm:px-4 lg:px-6 xl:px-8 sm:py-8 pt-20 sm:pt-24 py-0 mx-0 px-[10px]">
          <DashboardHeader
            user={user}
            profile={profile}
            title="Artist Dashboard"
            subtitle="Manage your artworks, projects, profile, and earnings"
          />

          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="overflow-x-auto mb-6 sm:mb-8 pb-1">
              <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-12 sm:h-14 p-1 gap-1 bg-background border border-border rounded-xl shadow-sm">
                <TabsTrigger
                  value="artworks"
                  className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Artworks</span>
                  <span className="sm:hidden">Art</span>
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Projects</span>
                  <span className="sm:hidden">Proj</span>
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <Wrench className="h-4 w-4" />
                  <span className="hidden sm:inline">Services</span>
                  <span className="sm:hidden">Svc</span>
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                  <span className="sm:hidden">Prof</span>
                </TabsTrigger>
                <TabsTrigger
                  value="premium"
                  className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <Crown className="h-4 w-4" />
                  <span className="hidden sm:inline">Premium</span>
                  <span className="sm:hidden">Prem</span>
                </TabsTrigger>
                <TabsTrigger
                  value="earnings"
                  className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Earnings</span>
                  <span className="sm:hidden">Earn</span>
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Messages</span>
                  <span className="sm:hidden">Msg</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                  <span className="sm:hidden">Notif</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Set</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="artworks" className="space-y-6">
              <ArtworkManagement />
            </TabsContent>
            <TabsContent value="projects" className="space-y-6">
              <ProjectManagement />
            </TabsContent>
            <TabsContent value="services" className="space-y-6">
              <ServicesManagement />
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
      </div>
    </ProtectedRoute>
  );
};

export default ArtistDashboard;