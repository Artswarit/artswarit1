
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
import { Palette, User, DollarSign, MessageSquare, Settings, Crown, Bell, FolderUp, Briefcase } from 'lucide-react';
import ArtworkUpload from '@/components/artwork/ArtworkUpload';
import ProjectManagement from '@/components/dashboard/projects/ProjectManagement';
import ArtistNotifications from '@/components/dashboard/ArtistNotifications';
import UniversalChatbot from '@/components/UniversalChatbot';

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
        <main className="container mx-auto px-4 py-8 pt-24">
          <DashboardHeader 
            user={user} 
            profile={profile}
            title="Artist Dashboard"
            subtitle="Manage your artworks, projects, profile, and earnings"
          />

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-8 overflow-auto">
              <TabsTrigger value="artworks" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Artworks</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="premium" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Premium</span>
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Earnings</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

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
