import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { computeProfileCompletion } from '@/hooks/useProfileCompletion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ArtworkManagement from '@/components/dashboard/ArtworkManagement';
import ArtistProfile from '@/components/dashboard/ArtistProfile';
import ArtistEarnings from '@/components/dashboard/ArtistEarnings';
import MessagingModule from '@/components/dashboard/messages/MessagingModule';
import ArtistSettings from '@/components/dashboard/ArtistSettings';
import PremiumMembership from '@/components/premium/PremiumMembership';
import { ArtistBilling } from '@/components/dashboard/ArtistBilling';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, User, DollarSign, MessageSquare, Settings, Crown, Bell, Briefcase, Wrench, Lock, Wallet, Users } from 'lucide-react';
import ProjectManagement from '@/components/dashboard/projects/ProjectManagement';
import ArtistNotifications from '@/components/dashboard/ArtistNotifications';
import ServicesManagement from '@/components/dashboard/services/ServicesManagement';
import ExclusiveMembers from '@/components/dashboard/ExclusiveMembers';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import LogoLoader from '@/components/ui/LogoLoader';

const ArtistDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile, uploadImage } = useProfile();
  const completion = useMemo(() => computeProfileCompletion(profile), [profile]);
  const { isComplete, completionPercentage, missingFields } = completion;
  const { toast } = useToast();
  const [isChatActive, setIsChatActive] = useState(false);
  const activeTab = tab || 'profile';
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([activeTab]));

  useEffect(() => {
    if (activeTab) {
      setVisitedTabs(prev => new Set(prev).add(activeTab));
    }
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem('artist_dashboard_active_tab', activeTab);
  }, [activeTab]);

  // No production logging — removed console.log

  // Check if profile is loaded and complete
  const profileReady = !profileLoading;
  const profileIncomplete = profileReady && !isComplete;

  useEffect(() => {
    if (profile && profile.role !== 'artist' && profile.role !== 'premium') {
      navigate('/client-dashboard');
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (!profileReady) return;

    const savedTab = sessionStorage.getItem('artist_dashboard_active_tab');

    if (profileIncomplete && tab !== 'premium') {
      if (tab !== 'profile') {
        setSearchParams({ tab: 'profile' }, { replace: true });
      }
      return;
    }

    if (!tab) {
      if (savedTab) {
        setSearchParams({ tab: savedTab }, { replace: true });
      } else if (isComplete) {
        setSearchParams({ tab: 'artworks' }, { replace: true });
      }
    }
  }, [profileReady, profileIncomplete, isComplete, tab, navigate]);

  // Handle tab change with URL sync
  const handleTabChange = (newTab: string) => {
    if (profileIncomplete && newTab !== 'profile' && newTab !== 'premium') {
      toast({
        title: "Complete Your Profile First",
        description: `Please fill in: ${missingFields.join(', ')} before accessing other sections.`,
        variant: "destructive"
      });
      return;
    }
    setSearchParams({ tab: newTab });
  };

  // Scroll Position Tracking
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`artist_dashboard_scroll_${activeTab}`, window.scrollY.toString());
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', debouncedScroll);
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [activeTab]);

  // Restore scroll position when tab changes
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(`artist_dashboard_scroll_${activeTab}`);
    if (savedScroll) {
      // Small delay to allow content to render
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll), behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
  }, [activeTab]);

  if (profileLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-background flex items-center justify-center">
        <LogoLoader text="Loading dashboard…" />
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
    { value: 'billing', label: 'Billing', shortLabel: 'Bill', icon: Wallet },
    { value: 'messages', label: 'Messages', shortLabel: 'Msg', icon: MessageSquare },
    { value: 'notifications', label: 'Notifications', shortLabel: 'Notif', icon: Bell },
    { value: 'settings', label: 'Settings', shortLabel: 'Set', icon: Settings },
    { value: 'exclusive', label: 'Exclusive Circle', shortLabel: 'Excl', icon: Users },
  ];

  return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-background">
        <Navbar />
        <main className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 pt-20 sm:pt-28 pb-12 sm:pb-20">
          <DashboardHeader
            user={user}
            profile={profile}
            title="Artist Dashboard"
            subtitle="Manage your artworks, projects, profile, and earnings"
          />

          {/* Mandatory Profile Completion Alert */}
          {profileIncomplete && (
            <div className="mb-8 sm:mb-12 p-5 sm:p-8 rounded-[2rem] bg-gradient-to-br from-red-500/5 via-orange-500/5 to-amber-500/5 border border-red-500/10 shadow-2xl shadow-red-500/5 animate-in fade-in slide-in-from-top-6 duration-700 ease-out relative overflow-hidden group">
              {/* Decorative background pulse */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors duration-500" />
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-inner">
                  <Lock className="h-8 w-8 text-red-600 animate-pulse" />
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-3">
                  <h3 className="font-black text-foreground text-xl sm:text-2xl tracking-tight">Complete Your Creative Profile</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                    Unlock the full potential of Artswarit. Your professional presence is currently 
                    <span className="mx-1.5 px-2 py-0.5 rounded-lg bg-red-500 text-white font-black">{completionPercentage}%</span> 
                    ready.
                  </p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                    {missingFields.map((field) => (
                      <span key={field} className="text-[10px] font-black text-red-700 bg-red-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-red-500/10 hover:bg-red-500/20 transition-colors cursor-default">
                        {field}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 w-full max-w-md mx-auto md:mx-0">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Progress to Launch</span>
                      <span className="text-xs font-black text-red-600">{completionPercentage}%</span>
                    </div>
                    <div className="bg-muted/30 rounded-full h-3 overflow-hidden border border-border/20 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 via-orange-600 to-amber-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="relative mb-8 sm:mb-12 group">
              {/* Mobile scroll indicator gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50/50 dark:from-background to-transparent z-10 pointer-events-none md:hidden" />
              
              <div className="overflow-x-auto pb-4 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory scroll-smooth">
                <TabsList className="bg-white/80 dark:bg-card/80 backdrop-blur-md inline-flex sm:flex sm:flex-wrap lg:grid lg:grid-cols-5 xl:grid-cols-10 gap-2 p-1.5 rounded-[1.5rem] shadow-xl border border-border/40 min-w-full sm:min-w-0 h-auto min-h-[80px] sm:min-h-0">
                  {tabs.map((tabItem) => {
                    const Icon = tabItem.icon;
                    const isDisabled = profileIncomplete && tabItem.value !== 'profile' && tabItem.value !== 'premium';
                    
                    return (
                      <TabsTrigger
                        key={tabItem.value}
                        value={tabItem.value}
                        disabled={isDisabled}
                        className={cn(
                          "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                          "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                          "hover:bg-primary/5 hover:text-primary", 
                          isDisabled && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 sm:h-4.5 sm:w-4.5 shrink-0 transition-transform duration-300",
                          "group-data-[state=active]:scale-110"
                        )} />
                        <span className="font-bold sm:font-medium whitespace-nowrap tracking-tight">{tabItem.label}</span>
                        {isDisabled && <Lock className="h-2 w-2 sm:h-3 sm:w-3 ml-0.5 opacity-50 shrink-0" />}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <TabsContent value="artworks" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'artworks' && "hidden")}>
                  {visitedTabs.has('artworks') && <ArtworkManagement />}
                </div>
              </TabsContent>
              <TabsContent value="projects" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'projects' && "hidden")}>
                  {visitedTabs.has('projects') && <ProjectManagement />}
                </div>
              </TabsContent>
              <TabsContent value="services" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'services' && "hidden")}>
                  {visitedTabs.has('services') && <ServicesManagement />}
                </div>
              </TabsContent>
              <TabsContent value="profile" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'profile' && "hidden")}>
                  {visitedTabs.has('profile') && (
                    <ArtistProfile
                      isLoading={profileLoading}
                      profile={profile}
                      updateProfile={updateProfile}
                      uploadImage={uploadImage}
                    />
                  )}
                </div>
              </TabsContent>
              <TabsContent value="premium" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'premium' && "hidden")}>
                  {visitedTabs.has('premium') && <PremiumMembership />}
                </div>
              </TabsContent>
              <TabsContent value="earnings" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'earnings' && "hidden")}>
                  {visitedTabs.has('earnings') && <ArtistEarnings isLoading={profileLoading} />}
                </div>
              </TabsContent>
              <TabsContent value="billing" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'billing' && "hidden")}>
                  {visitedTabs.has('billing') && <ArtistBilling />}
                </div>
              </TabsContent>
              <TabsContent value="messages" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'messages' && "hidden")}>
                  {visitedTabs.has('messages') && <MessagingModule onChatActiveChange={setIsChatActive} />}
                </div>
              </TabsContent>
              <TabsContent value="notifications" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'notifications' && "hidden")}>
                  {visitedTabs.has('notifications') && <ArtistNotifications isLoading={profileLoading} />}
                </div>
              </TabsContent>
              <TabsContent value="settings" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'settings' && "hidden")}>
                  {visitedTabs.has('settings') && <ArtistSettings isLoading={profileLoading} />}
                </div>
              </TabsContent>
              <TabsContent value="exclusive" className="outline-none focus-visible:ring-0" forceMount>
                <div className={cn(activeTab !== 'exclusive' && "hidden")}>
                  {visitedTabs.has('exclusive') && <ExclusiveMembers />}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </main>
        <div className={cn(activeTab === 'messages' && isChatActive ? "hidden md:block" : "")}>
          <Footer />
        </div>
      </div>
  );
};

export default ArtistDashboard;
