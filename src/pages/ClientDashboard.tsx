import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LayoutDashboard, Users, MessageSquare, FileText, Settings, CreditCard, Heart, Bell, ChevronRight, Search, CheckCircle, Clock, Star, Lock, User, PlusCircle, Bookmark } from "lucide-react";
import Navbar from "@/components/Navbar";
import SavedArtists from "@/components/dashboard/SavedArtists";
import SavedArtworks from "@/components/dashboard/SavedArtworks";
import ClientMessages from "@/components/dashboard/ClientMessages";
import ProjectRating from "@/components/dashboard/ProjectRating";
import ClientPayments from "@/components/dashboard/ClientPayments";
import ClientSettings from "@/components/dashboard/ClientSettings";
import ClientProfile from "@/components/dashboard/ClientProfile";
import ProjectDetailModal from "@/components/dashboard/projects/ProjectDetailModal";
import UniversalChatbot from '@/components/UniversalChatbot';
import { CreateProjectForm } from "@/components/projects";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { computeProfileCompletion } from "@/hooks/useProfileCompletion";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
interface Project {
  id: string;
  title: string;
  description: string;
  artist: string;
  artistId: string;
  artistAvatar: string;
  dueDate: string;
  completedDate?: string;
  progress: number;
  status: string;
  rating?: number;
  budget: number;
}
interface RecommendedArtist {
  id: string;
  name: string;
  profession: string;
  rating: number;
  profileImage: string;
}
const ClientDashboard = () => {
  const { user } = useAuth();
  const { toast: hookToast } = useToast();
  const { profile, loading: profileLoading } = useProfile();
  const { format } = useCurrencyFormat();
  
  // Profile completion check
  const completion = useMemo(() => computeProfileCompletion(profile), [profile]);
  const { isComplete, completionPercentage, missingFields } = completion;
  const profileReady = !profileLoading;
  const profileIncomplete = profileReady && !isComplete;
  
  const [searchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [savedArtistsCount, setSavedArtistsCount] = useState(0);
  const [recommendedArtists, setRecommendedArtists] = useState<RecommendedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  // Force profile tab when profile is incomplete
  useEffect(() => {
    if (profileReady && profileIncomplete) {
      setSelectedTab('profile');
    }
  }, [profileReady, profileIncomplete]);

  // Handle tab change with blocking logic
  const handleTabChange = (newTab: string) => {
    if (profileIncomplete && newTab !== 'profile') {
      hookToast({
        title: "Complete Your Profile First",
        description: `Please fill in: ${missingFields.join(', ')} before accessing other sections.`,
        variant: "destructive"
      });
      return;
    }
    setSelectedTab(newTab);
  };

  // Read tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'profile', 'projects', 'messages', 'artists', 'ratings', 'payments', 'settings'].includes(tabParam)) {
      if (profileIncomplete && tabParam !== 'profile') {
        setSelectedTab('profile');
      } else {
        setSelectedTab(tabParam);
      }
    }
  }, [searchParams, profileIncomplete]);
  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Fetch projects
      const {
        data: projectsData,
        error
      } = await supabase.from('projects').select('*').eq('client_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      const projects = projectsData || [];

      // Fetch artist profiles for all projects that have artist_id
      const artistIds = projects.filter(p => p.artist_id).map(p => p.artist_id);
      let artistProfiles: Record<string, any> = {};
      if (artistIds.length > 0) {
        const {
          data: profiles
        } = await supabase.from('public_profiles').select('id, full_name, avatar_url').in('id', artistIds);
        (profiles || []).forEach(p => {
          if (p.id) artistProfiles[p.id] = p;
        });
      }

      // Fetch reviews for completed projects to get ratings
      const projectIds = projects.filter(p => p.status === 'completed').map(p => p.id);
      let ratingsMap: Record<string, number> = {};
      if (projectIds.length > 0) {
        const {
          data: reviews
        } = await supabase.from('project_reviews').select('project_id, rating').in('project_id', projectIds);
        (reviews || []).forEach(r => {
          ratingsMap[r.project_id] = r.rating;
        });
      }
      const transformedProjects: Project[] = projects.map((project: any) => {
        const artistProfile = artistProfiles[project.artist_id] || {};
        return {
          id: project.id,
          title: project.title,
          description: project.description || '',
          artist: artistProfile.full_name || 'Unassigned',
          artistId: project.artist_id || '',
          artistAvatar: artistProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.artist_id || 'default'}`,
          dueDate: project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : 'No deadline',
          completedDate: project.status === 'completed' ? new Date(project.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : undefined,
          progress: project.progress ?? (project.status === 'completed' ? 100 : project.status === 'accepted' ? 10 : project.status === 'cancelled' ? 0 : 0),
          status: project.status === 'accepted' ? 'In Progress' : project.status === 'completed' ? 'Completed' : project.status === 'pending' ? 'Pending' : project.status === 'cancelled' ? 'Rejected' : 'Review',
          rating: ratingsMap[project.id] || 0,
          budget: project.budget || 0
        };
      });
      setProjects(transformedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    const {
      data
    } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', {
      ascending: false
    }).limit(5);
    setNotifications((data || []).map(n => ({
      id: n.id,
      content: n.message,
      time: new Date(n.created_at).toLocaleDateString(),
      read: n.is_read
    })));
  }, [user?.id]);
  const fetchSavedArtistsCount = useCallback(async () => {
    if (!user?.id) return;
    const {
      count
    } = await supabase.from('saved_artists').select('*', {
      count: 'exact',
      head: true
    }).eq('client_id', user.id);
    setSavedArtistsCount(count || 0);
  }, [user?.id]);
  const fetchRecommendedArtists = useCallback(async () => {
    try {
      // Fetch artists from profiles
      const {
        data: artists,
        error
      } = await supabase.from('public_profiles').select('id, full_name, avatar_url, bio, tags').eq('role', 'artist').limit(10);
      if (error) throw error;
      if (!artists || artists.length === 0) {
        setRecommendedArtists([]);
        return;
      }
      const artistIds = artists.map(a => a.id).filter(Boolean) as string[];

      // Get ratings for these artists
      const {
        data: reviews
      } = await supabase.from('project_reviews').select('artist_id, rating').in('artist_id', artistIds);
      const ratingMap = new Map<string, {
        total: number;
        count: number;
      }>();
      reviews?.forEach(r => {
        const existing = ratingMap.get(r.artist_id) || {
          total: 0,
          count: 0
        };
        ratingMap.set(r.artist_id, {
          total: existing.total + r.rating,
          count: existing.count + 1
        });
      });

      // Map to recommended artists format
      const mapped: RecommendedArtist[] = artists.filter(a => a.id).map(artist => {
        const ratingData = ratingMap.get(artist.id!);
        const avgRating = ratingData ? Math.round(ratingData.total / ratingData.count * 10) / 10 : 0;
        return {
          id: artist.id!,
          name: artist.full_name || 'Unknown Artist',
          profession: artist.tags?.[0] || 'Artist',
          rating: avgRating,
          profileImage: artist.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.id}`
        };
      })
      // Sort by rating (highest first) then take top 3
      .sort((a, b) => b.rating - a.rating).slice(0, 3);
      setRecommendedArtists(mapped);
    } catch (err) {
      console.error('Error fetching recommended artists:', err);
    }
  }, []);
  useEffect(() => {
    fetchProjects();
    fetchNotifications();
    fetchSavedArtistsCount();
    fetchRecommendedArtists();
  }, [fetchProjects, fetchNotifications, fetchSavedArtistsCount, fetchRecommendedArtists]);

  // Real-time subscription for projects
  useEffect(() => {
    if (!user?.id) return;
    const projectsChannel = supabase.channel(`client-projects-${user.id}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `client_id=eq.${user.id}`
    }, payload => {
      console.log('Project update received:', payload.eventType);
      fetchProjects();
      if (payload.eventType === 'UPDATE') {
        toast.success('Project status updated!');
      }
    }).subscribe();
    const notificationsChannel = supabase.channel(`client-notifications-${user.id}`).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, () => {
      fetchNotifications();
      toast.info('New notification received!');
    }).subscribe();
    const savedArtistsChannel = supabase.channel(`client-saved-artists-${user.id}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'saved_artists',
      filter: `client_id=eq.${user.id}`
    }, () => {
      fetchSavedArtistsCount();
    }).subscribe();
    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(savedArtistsChannel);
    };
  }, [user?.id, fetchProjects, fetchNotifications, fetchSavedArtistsCount]);
  const activeProjects = projects.filter(p => p.status === "In Progress" || p.status === "Review" || p.status === "Pending");
  const completedProjects = projects.filter(p => p.status === "Completed");
  const rejectedProjects = projects.filter(p => p.status === "Rejected");
  const userName = 'there';
  return <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pt-16 sm:pt-20">
        {/* Dashboard Header - Mobile optimized */}
        <div className="mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
          <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">Welcome back, {userName}! Manage your projects and discover new artists.</p>
        </div>

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
                    Complete your profile to access all dashboard features. Your profile is {completionPercentage}% complete.
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

        {/* Dashboard Navigation - Horizontal scroll on mobile */}
        <Tabs value={selectedTab} className="mb-4 sm:mb-6 lg:mb-8" onValueChange={handleTabChange}>
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 mb-4 sm:mb-6 scrollbar-hide">
            <TabsList className="bg-white/50 dark:bg-card/50 backdrop-blur-sm inline-flex min-w-max sm:grid sm:grid-cols-8 gap-1 p-1">
              <TabsTrigger value="overview" disabled={profileIncomplete} className={cn("flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", "hover:bg-muted/50", profileIncomplete && "opacity-50 cursor-not-allowed")}>
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
                {profileIncomplete && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="profile" className={cn("flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", "hover:bg-muted/50")}>
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="projects" disabled={profileIncomplete} className={cn("flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", "hover:bg-muted/50", profileIncomplete && "opacity-50 cursor-not-allowed")}>
                <FileText className="h-4 w-4" />
                <span>Projects</span>
                {profileIncomplete && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="messages" disabled={profileIncomplete} className={cn("flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", "hover:bg-muted/50", profileIncomplete && "opacity-50 cursor-not-allowed")}>
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </TabsTrigger>
              <TabsTrigger value="saved" disabled={profileIncomplete} className={cn("flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", "hover:bg-muted/50", profileIncomplete && "opacity-50 cursor-not-allowed")}>
                <Bookmark className="h-4 w-4" />
                <span>Saved</span>
              </TabsTrigger>
              <TabsTrigger value="artists" disabled={profileIncomplete} className={cn("flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", "hover:bg-muted/50", profileIncomplete && "opacity-50 cursor-not-allowed")}>
                <Heart className="h-4 w-4" />
                <span>Following</span>
              </TabsTrigger>
              <TabsTrigger value="ratings" disabled={profileIncomplete} className={cn("flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", "hover:bg-muted/50", profileIncomplete && "opacity-50 cursor-not-allowed")}>
                <Star className="h-4 w-4" />
                <span>Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="payments" disabled={profileIncomplete} className={cn("flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", "hover:bg-muted/50", profileIncomplete && "opacity-50 cursor-not-allowed")}>
                <CreditCard className="h-4 w-4" />
                <span>Payments</span>
              </TabsTrigger>
              <TabsTrigger value="settings" disabled={profileIncomplete} className={cn("flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground", "hover:bg-muted/50", profileIncomplete && "opacity-50 cursor-not-allowed")}>
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            {/* Stats Row - Mobile responsive grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <h3 className="font-medium text-[10px] sm:text-xs lg:text-sm text-muted-foreground mb-1 sm:mb-2">Active</h3>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{activeProjects.length}</p>
              </div>
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <h3 className="font-medium text-[10px] sm:text-xs lg:text-sm text-muted-foreground mb-1 sm:mb-2">Completed</h3>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{completedProjects.length}</p>
              </div>
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <h3 className="font-medium text-[10px] sm:text-xs lg:text-sm text-muted-foreground mb-1 sm:mb-2">Saved</h3>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{savedArtistsCount}</p>
              </div>
            </div>

            {/* Active Projects Section */}
            <div className="animate-fade-in" style={{
            animationDelay: '100ms'
          }}>
              <div className="flex justify-between items-center gap-2 mb-3 sm:mb-4">
                <h2 className="font-heading text-base sm:text-lg lg:text-xl font-semibold">Active Projects</h2>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={() => setSelectedTab('projects')}>
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {activeProjects.length === 0 ? <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-6 rounded-xl text-center text-muted-foreground">
                    No active projects yet
                  </div> : activeProjects.slice(0, 3).map((project, index) => <div key={project.id} className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border hover:shadow-md transition-all duration-300 hover:scale-[1.01] animate-fade-in" style={{
                animationDelay: `${index * 50}ms`
              }}>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                          <h3 className="font-medium text-sm sm:text-base truncate">{project.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">Artist: {project.artist}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-gray-200 dark:bg-muted rounded-full h-1.5 sm:h-2">
                              <div className="bg-gradient-to-r from-artswarit-purple to-blue-500 h-full rounded-full transition-all duration-500" style={{
                          width: `${project.progress}%`
                        }} />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium min-w-[30px]">{project.progress}%</span>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 w-full sm:w-auto justify-between sm:justify-start">
                          <span className="text-[10px] sm:text-xs text-gray-500 order-2 sm:order-1">Due: {project.dueDate}</span>
                          <span className={cn("inline-block px-2 py-0.5 text-[10px] sm:text-xs rounded-full order-1 sm:order-2", project.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : project.status === "Rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300")}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    </div>)}
              </div>
            </div>

            {/* Recommended Artists */}
            <div className="animate-fade-in" style={{
            animationDelay: '200ms'
          }}>
              <div className="flex justify-between items-center gap-2 mb-3 sm:mb-4">
                <h2 className="font-heading text-base sm:text-lg lg:text-xl font-semibold">Recommended</h2>
                <Button variant="ghost" size="sm" asChild className="text-artswarit-purple text-xs sm:text-sm h-8 sm:h-9">
                  <Link to="/explore" className="flex items-center">
                    Explore
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {recommendedArtists.map((artist, index) => <Link key={artist.id} to={`/artist/${artist.id}`} className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in" style={{
                animationDelay: `${index * 50}ms`
              }}>
                    <div className="flex items-center gap-3">
                      <img src={artist.profileImage} alt={artist.name} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-white dark:ring-border" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{artist.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{artist.profession}</p>
                      </div>
                      <div className="flex items-center shrink-0">
                        <span className="text-yellow-500">★</span>
                        <span className="text-xs sm:text-sm font-medium ml-1">{artist.rating}</span>
                      </div>
                    </div>
                  </Link>)}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="animate-fade-in" style={{
            animationDelay: '300ms'
          }}>
              <div className="flex justify-between items-center gap-2 mb-3 sm:mb-4">
                <h2 className="font-heading text-base sm:text-lg lg:text-xl font-semibold">Notifications</h2>
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9" onClick={() => setSelectedTab('settings')}>
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Manage</span>
                </Button>
              </div>
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border divide-y divide-gray-100 dark:divide-border">
                {notifications.length === 0 ? <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications yet
                  </div> : notifications.map((notification, index) => <div key={notification.id} className={cn("p-3 sm:p-4 flex items-start gap-2 sm:gap-3 transition-colors duration-200 animate-fade-in", notification.read ? '' : 'bg-blue-50/40 dark:bg-blue-900/10')} style={{
                animationDelay: `${index * 30}ms`
              }}>
                      <div className={cn("mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0 transition-colors", notification.read ? 'bg-transparent' : 'bg-blue-500')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm line-clamp-2">{notification.content}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>)}
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="font-heading text-base sm:text-lg lg:text-xl font-semibold">All Projects</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input type="text" placeholder="Search projects..." className="w-full sm:w-48 lg:w-64 pl-9 pr-4 py-2 border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-transparent bg-white/80 dark:bg-card/80" />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </div>
                </div>
                <Button className="w-full sm:w-auto text-sm" onClick={() => setCreateProjectOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border">
                <h3 className="font-heading text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-600" />
                  In Progress
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {activeProjects.length === 0 ? <p className="text-muted-foreground text-sm text-center py-4">No active projects</p> : activeProjects.map((project, index) => <div key={project.id} className="p-3 sm:p-4 border border-gray-100 dark:border-border rounded-lg bg-white/70 dark:bg-card/70 transition-all duration-300 hover:shadow-md animate-fade-in" style={{
                  animationDelay: `${index * 50}ms`
                }}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <img src={project.artistAvatar} alt={project.artist} className="h-8 w-8 rounded-full object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base truncate">{project.title}</h4>
                              <Link to={`/artist/${project.artistId}`} className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                                {project.artist}
                              </Link>
                            </div>
                          </div>
                          <span className={cn("px-2 py-0.5 text-[10px] sm:text-xs rounded-full shrink-0", project.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300")}>
                            {project.status}
                          </span>
                        </div>
                        {project.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{project.description}</p>}
                        <div className="flex items-center gap-2 mt-2 sm:mt-3">
                          <div className="flex-1 bg-gray-200 dark:bg-muted rounded-full h-1.5 sm:h-2">
                            <div className="bg-gradient-to-r from-artswarit-purple to-blue-500 h-full rounded-full transition-all duration-500" style={{
                        width: `${project.progress}%`
                      }} />
                          </div>
                          <span className="text-[10px] sm:text-xs font-medium">{project.progress}%</span>
                        </div>
                        <div className="mt-2 sm:mt-3 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] sm:text-xs text-gray-500">Due: {project.dueDate}</span>
                            {project.budget > 0 && <span className="text-[10px] sm:text-xs text-green-600 font-medium">
                                ${project.budget.toLocaleString()}
                              </span>}
                          </div>
                          <Button size="sm" variant="outline" className="h-7 sm:h-8 text-xs" onClick={() => {
                      setSelectedProjectId(project.id);
                      setProjectModalOpen(true);
                    }}>
                            View
                          </Button>
                        </div>
                      </div>)}
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border">
                <h3 className="font-heading text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                  Completed
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {completedProjects.length === 0 ? <p className="text-muted-foreground text-sm text-center py-4">No completed projects</p> : completedProjects.map((project, index) => <div key={project.id} className="p-3 sm:p-4 border border-gray-100 dark:border-border rounded-lg bg-white/70 dark:bg-card/70 transition-all duration-300 hover:shadow-md animate-fade-in" style={{
                  animationDelay: `${index * 50}ms`
                }}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <img src={project.artistAvatar} alt={project.artist} className="h-8 w-8 rounded-full object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base truncate">{project.title}</h4>
                              <Link to={`/artist/${project.artistId}`} className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                                {project.artist}
                              </Link>
                            </div>
                          </div>
                          <div className="flex shrink-0">
                            {[...Array(project.rating || 0)].map((_, i) => <span key={i} className="text-yellow-400 text-xs sm:text-sm">★</span>)}
                            {project.rating === 0 && <span className="text-xs text-muted-foreground">No rating</span>}
                          </div>
                        </div>
                        {project.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{project.description}</p>}
                        <div className="mt-2 sm:mt-3 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] sm:text-xs text-gray-500">Completed: {project.completedDate}</span>
                            {project.budget > 0 && <span className="text-[10px] sm:text-xs text-green-600 font-medium">
                                ${project.budget.toLocaleString()}
                              </span>}
                          </div>
                          <Button size="sm" variant="outline" className="h-7 sm:h-8 text-xs" onClick={() => {
                      setSelectedProjectId(project.id);
                      setProjectModalOpen(true);
                    }}>
                            View
                          </Button>
                        </div>
                      </div>)}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="animate-fade-in">
            <ClientProfile />
          </TabsContent>
          
          {/* Messages Tab */}
          <TabsContent value="messages" className="animate-fade-in">
            <ClientMessages />
          </TabsContent>
          
          <TabsContent value="saved" className="animate-fade-in">
            <SavedArtworks />
          </TabsContent>

          <TabsContent value="artists" className="animate-fade-in">
            <SavedArtists />
          </TabsContent>

          <TabsContent value="ratings" className="animate-fade-in">
            <ProjectRating />
          </TabsContent>
          
          <TabsContent value="payments" className="animate-fade-in">
            <ClientPayments />
          </TabsContent>
          
          <TabsContent value="settings" className="animate-fade-in">
            <ClientSettings />
          </TabsContent>
        </Tabs>
      </div>
      
      <ProjectDetailModal projectId={selectedProjectId} open={projectModalOpen} onOpenChange={setProjectModalOpen} />
      
      {/* Create Project Dialog */}
      <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <CreateProjectForm 
            onSuccess={() => {
              setCreateProjectOpen(false);
              fetchProjects();
              toast.success("Project created successfully!");
            }}
            onCancel={() => setCreateProjectOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>;
};
export default ClientDashboard;