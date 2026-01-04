import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
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
import { Palette, User, DollarSign, MessageSquare, Settings, Crown, Bell, Briefcase, Wrench, Lock } from 'lucide-react';
import ProjectManagement from '@/components/dashboard/projects/ProjectManagement';
import ArtistNotifications from '@/components/dashboard/ArtistNotifications';
import ServicesManagement from '@/components/dashboard/services/ServicesManagement';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ArtistDashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { isComplete, completionPercentage, missingFields, loading: completionLoading } = useProfileCompletion();
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  // Check if profile is loaded and complete
  const profileReady = !completionLoading && !profileLoading;
  const profileIncomplete = profileReady && !isComplete;

  useEffect(() => {
    if (profile && profile.role !== 'artist' && profile.role !== 'premium') {
      navigate('/client-dashboard');
    }
  }, [profile, navigate]);

  // Force profile tab when profile is incomplete
  useEffect(() => {
    if (profileReady) {
      if (profileIncomplete) {
        // Always force to profile tab when incomplete
        setActiveTab('profile');
      } else if (tab && tab !== activeTab) {
        // Allow tab navigation when profile is complete
        setActiveTab(tab);
      } else if (!tab && isComplete) {
        // Default to artworks when complete and no tab specified
        setActiveTab('artworks');
      }
    }
  }, [profileReady, profileIncomplete, isComplete, tab]);

  // Handle tab change with blocking logic
  const handleTabChange = (newTab: string) => {
    if (profileIncomplete && newTab !== 'profile') {
      toast({
        title: "Complete Your Profile First",
        description: `Please fill in: ${missingFields.join(', ')} before accessing other sections.`,
        variant: "destructive"
      });
      return;
    }
    setActiveTab(newTab);
  };

  if (profileLoading || completionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Tab configuration with disabled state
  const tabs = [
    { value: 'artworks', label: 'Artworks', shortLabel: 'Art', icon: Palette },
    { value: 'projects', label: 'Projects', shortLabel: 'Proj', icon: Briefcase },
    { value: 'services', label: 'Services', shortLabel: 'Svc', icon: Wrench },
    { value: 'profile', label: 'Profile', shortLabel: 'Prof', icon: User },
    { value: 'premium', label: 'Premium', shortLabel: 'Prem', icon: Crown },
    { value: 'earnings', label: 'Earnings', shortLabel: 'Earn', icon: DollarSign },
    { value: 'messages', label: 'Messages', shortLabel: 'Msg', icon: MessageSquare },
    { value: 'notifications', label: 'Notifications', shortLabel: 'Notif', icon: Bell },
    { value: 'settings', label: 'Settings', shortLabel: 'Set', icon: Settings },
  ];

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

          {/* Mandatory Profile Completion Alert */}
          {profileIncomplete && (
            <div className="mb-6 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border-2 border-red-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-full bg-red-500/20">
                    <Lock className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">Profile Completion Required</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You must complete your profile before accessing other dashboard features. 
                      Your profile is currently {completionPercentage}% complete.
                    </p>
                    <p className="text-sm text-red-600 font-medium mt-2">
                      Missing: {missingFields.join(', ')}
                    </p>
                    <div className="mt-3 bg-muted rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="overflow-x-auto mb-6 sm:mb-8 pb-1">
              <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-12 sm:h-14 p-1 gap-1 bg-background border border-border rounded-xl shadow-sm">
                {tabs.map((tabItem) => {
                  const Icon = tabItem.icon;
                  const isDisabled = profileIncomplete && tabItem.value !== 'profile';
                  
                  return (
                    <TabsTrigger
                      key={tabItem.value}
                      value={tabItem.value}
                      disabled={isDisabled}
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-lg transition-all",
                        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tabItem.label}</span>
                      <span className="sm:hidden">{tabItem.shortLabel}</span>
                      {isDisabled && <Lock className="h-3 w-3 ml-1" />}
                    </TabsTrigger>
                  );
                })}
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