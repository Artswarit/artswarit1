
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, User, DollarSign, MessageSquare, Settings, Crown, Bell, Briefcase } from 'lucide-react';
import ProjectManagement from '@/components/dashboard/projects/ProjectManagement';
import ArtistNotifications from '@/components/dashboard/ArtistNotifications';
import UniversalChatbot from '@/components/UniversalChatbot';
import ErrorBoundary from '@/components/ErrorBoundary';

const ArtistDashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useProfile();

  useEffect(() => {
    console.log('Profile data in dashboard:', profile);
    if (profile && profile.role !== 'artist' && profile.role !== 'premium') {
      console.log('Redirecting non-artist user');
      navigate('/client-dashboard');
    }
  }, [profile, navigate]);

  // Refresh profile when user changes
  useEffect(() => {
    if (user) {
      refetchProfile();
    }
  }, [user, refetchProfile]);

  const defaultTab = tab || 'artworks';

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    console.error('Profile error:', profileError);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Connection Error</h2>
            <p className="text-red-600 mb-4">{profileError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
                <TabsList className="grid grid-cols-4 sm:grid-cols-7 w-full min-w-[600px] sm:min-w-0 bg-white/60 backdrop-blur-sm">
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
                <ErrorBoundary>
                  <ArtworkManagement />
                </ErrorBoundary>
              </TabsContent>
              <TabsContent value="projects" className="space-y-6">
                <ErrorBoundary>
                  <ProjectManagement />
                </ErrorBoundary>
              </TabsContent>
              <TabsContent value="profile" className="space-y-6">
                <ErrorBoundary>
                  <ArtistProfile isLoading={profileLoading} />
                </ErrorBoundary>
              </TabsContent>
              <TabsContent value="premium" className="space-y-6">
                <ErrorBoundary>
                  <PremiumMembership />
                </ErrorBoundary>
              </TabsContent>
              <TabsContent value="earnings" className="space-y-6">
                <ErrorBoundary>
                  <ArtistEarnings isLoading={profileLoading} />
                </ErrorBoundary>
              </TabsContent>
              <TabsContent value="messages" className="space-y-6">
                <ErrorBoundary>
                  <MessagingModule />
                </ErrorBoundary>
              </TabsContent>
              <TabsContent value="notifications" className="space-y-6">
                <ErrorBoundary>
                  <ArtistNotifications isLoading={profileLoading} />
                </ErrorBoundary>
              </TabsContent>
              <TabsContent value="settings" className="space-y-6">
                <ErrorBoundary>
                  <ArtistSettings isLoading={profileLoading} />
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          </main>
          <Footer />
          <UniversalChatbot />
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
};

export default ArtistDashboard;
