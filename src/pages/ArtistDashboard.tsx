
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useArtworks } from '@/hooks/useArtworks';
import { useProjects } from '@/hooks/useProjects';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import ApprovalPending from '@/components/auth/ApprovalPending';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ArtworkManagement from '@/components/dashboard/ArtworkManagement';
import ArtistProfile from '@/components/dashboard/ArtistProfile';
import ArtistEarnings from '@/components/dashboard/ArtistEarnings';
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics';
import MessagingModule from '@/components/dashboard/messages/MessagingModule';
import ArtistSettings from '@/components/dashboard/ArtistSettings';
import PremiumMembership from '@/components/premium/PremiumMembership';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, User, DollarSign, MessageSquare, Settings, Crown, Bell, FolderUp, Briefcase, Plus, BarChart3 } from 'lucide-react';
import ArtworkUpload from '@/components/artwork/ArtworkUpload';
import ProjectManagement from '@/components/dashboard/projects/ProjectManagement';
import ArtistNotifications from '@/components/dashboard/ArtistNotifications';
import UniversalChatbot from '@/components/UniversalChatbot';

const ArtistDashboard = () => {
  const { tab } = useParams();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { artworks } = useArtworks({ artistId: user?.id });
  const { projects } = useProjects();

  useEffect(() => {
    if (profile && profile.role !== 'artist' && profile.role !== 'premium') {
      window.location.href = '/client-dashboard';
    }
  }, [profile]);

  const defaultTab = tab || 'artworks';

  // Check if artist has any data to show
  const hasArtworks = artworks.length > 0;
  const hasProjects = projects.length > 0;
  const isNewArtist = !hasArtworks && !hasProjects;

  const WelcomeMessage = () => (
    <div className="text-center py-12">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 max-w-md mx-auto">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Welcome to Artswarit!</h3>
        <p className="text-gray-600 mb-4">
          Your dashboard will be updated once you upload artwork or receive communication.
        </p>
        <Button className="w-full mb-3">
          Upload Your First Artwork
        </Button>
        <p className="text-xs text-gray-500">
          Start building your portfolio and connecting with clients
        </p>
      </div>
    </div>
  );

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
            <div className="overflow-x-auto mb-6 sm:mb-8">
              <TabsList className="grid grid-cols-4 sm:grid-cols-9 w-full min-w-[700px] sm:min-w-0 bg-white/60 backdrop-blur-sm">
                <TabsTrigger value="artworks" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Artworks</span>
                  <span className="xs:hidden">Art</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Projects</span>
                  <span className="xs:hidden">Proj</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Profile</span>
                  <span className="xs:hidden">Prof</span>
                </TabsTrigger>
                <TabsTrigger value="premium" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Premium</span>
                  <span className="xs:hidden">Prem</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Analytics</span>
                  <span className="xs:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger value="earnings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Earnings</span>
                  <span className="xs:hidden">Earn</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Messages</span>
                  <span className="xs:hidden">Msg</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Notifications</span>
                  <span className="xs:hidden">Bell</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Settings</span>
                  <span className="xs:hidden">Set</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="artworks" className="space-y-6">
              {isNewArtist && !hasArtworks ? <WelcomeMessage /> : <ArtworkManagement />}
            </TabsContent>
            <TabsContent value="projects" className="space-y-6">
              {!hasProjects ? (
                <Card className="bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                    <p className="text-gray-600 mb-4">Projects will appear here when clients reach out to you.</p>
                    <Button variant="outline" asChild>
                      <Link to="/explore">Browse Platform</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ProjectManagement />
              )}
            </TabsContent>
            <TabsContent value="profile" className="space-y-6">
              <ArtistProfile isLoading={profileLoading} />
            </TabsContent>
            <TabsContent value="premium" className="space-y-6">
              <PremiumMembership />
            </TabsContent>
            <TabsContent value="analytics" className="space-y-6">
              <DashboardAnalytics />
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
