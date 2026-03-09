import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LayoutDashboard, Users, MessageSquare, FileText, Settings, CreditCard, Bell, ChevronRight, Search, CheckCircle, Clock, Star, Lock, User, PlusCircle, Bookmark, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import SavedArtists from "@/components/dashboard/SavedArtists";
import SavedArtworks from "@/components/dashboard/SavedArtworks";
import ClientMessages from "@/components/dashboard/ClientMessages";
import ProjectRating from "@/components/dashboard/ProjectRating";
import ClientPayments from "@/components/dashboard/ClientPayments";
import ClientSettings from "@/components/dashboard/ClientSettings";
import ClientProfile from "@/components/dashboard/ClientProfile";
import PurchasedArtworks from "@/components/dashboard/PurchasedArtworks";
import ProjectDetailModal from "@/components/dashboard/projects/ProjectDetailModal";
import { CreateProjectForm } from "@/components/projects";
import ArtistSelectionModal from "@/components/dashboard/projects/ArtistSelectionModal";
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
  isLocked: boolean;
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
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [selectedTab, setSelectedTab] = useState(currentTab);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [savedArtistsCount, setSavedArtistsCount] = useState(0);
  const [recommendedArtists, setRecommendedArtists] = useState<RecommendedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [artistSelectionOpen, setArtistSelectionOpen] = useState(false);
  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(null);
  // Button-level loading state to prevent double-clicks
  const [buttonLoading, setButtonLoading] = useState<Record<string, boolean>>({});
  // Project search state — wired to the projects tab filter
  const [projectSearch, setProjectSearch] = useState('');
  // Load-more state for Projects tab
  const [visibleActive, setVisibleActive] = useState(5);
  const [visibleCompleted, setVisibleCompleted] = useState(5);
  const PROJECTS_PER_PAGE = 5;

  // Force profile tab when profile is incomplete or set default tab
  useEffect(() => {
    if (profileReady) {
      if (profileIncomplete) {
        if (searchParams.get('tab') !== 'profile') {
          setSelectedTab('profile');
          setSearchParams({ tab: 'profile' }, { replace: true });
        }
      } else if (!searchParams.get('tab')) {
        // Default to overview when complete and no tab specified
        setSelectedTab('overview');
        setSearchParams({ tab: 'overview' }, { replace: true });
      }
    }
  }, [profileReady, profileIncomplete, searchParams, setSearchParams]);

  // Handle tab change with URL sync
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
    setSearchParams({ tab: newTab });
  };

  // Read tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'profile', 'projects', 'collection', 'messages', 'artists', 'ratings', 'payments', 'settings'].includes(tabParam)) {
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
        
        let statusDisplay = 'Pending Artist';
        if (project.status === 'accepted') statusDisplay = 'In Progress';
        else if (project.status === 'completed') statusDisplay = 'Completed';
        else if (project.status === 'pending') {
          if (!project.artist_id) {
            statusDisplay = 'Draft';
          } else if (project.is_locked) {
            statusDisplay = 'Pending Artist';
          } else {
            statusDisplay = 'Pending Confirm';
          }
        }
        else if (project.status === 'cancelled') statusDisplay = 'Rejected';
        else if (project.status === 'review') statusDisplay = 'Review';

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
          status: statusDisplay,
          rating: ratingsMap[project.id] || 0,
          budget: project.budget || 0,
          isLocked: !!project.is_locked
        };
      });
      setProjects(transformedProjects);
    } catch (err) {
      // Error fetching projects
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

  // State Preservation Logic
  useEffect(() => {
    // Restore state from storage on mount
    const restoreState = () => {
      // 1. Restore Tab (if not in URL)
      if (!searchParams.get('tab')) {
        const savedTab = localStorage.getItem('client_dashboard_active_tab');
        if (savedTab && ['overview', 'profile', 'projects', 'collection', 'messages', 'artists', 'ratings', 'payments', 'settings'].includes(savedTab)) {
          if (!profileIncomplete || savedTab === 'profile') {
            setSelectedTab(savedTab);
            setSearchParams({ tab: savedTab }, { replace: true });
          }
        }
      }

      // 2. Restore UI State (Dialogs, etc.)
      try {
        const savedUIState = sessionStorage.getItem('client_dashboard_ui_state');
        if (savedUIState) {
          const parsed = JSON.parse(savedUIState);
          if (parsed.createProjectOpen) setCreateProjectOpen(true);
          if (parsed.projectModalOpen && parsed.selectedProjectId) {
            setSelectedProjectId(parsed.selectedProjectId);
            setProjectModalOpen(true);
          }
          if (parsed.artistSelectionOpen && parsed.assigningProjectId) {
            setAssigningProjectId(parsed.assigningProjectId);
            setArtistSelectionOpen(true);
          }
        }
      } catch (e) {
        console.error("Failed to restore UI state", e);
      }
    };

    restoreState();
  }, []);

  // Restore scroll position when tab changes
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(`client_dashboard_scroll_${selectedTab}`);
    if (savedScroll) {
      // Small delay to allow content to render
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll), behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
  }, [selectedTab]);

  // Save State Logic
  useEffect(() => {
    // 1. Save Tab
    if (selectedTab) {
      localStorage.setItem('client_dashboard_active_tab', selectedTab);
    }

    // 2. Save UI State
    const uiState = {
      createProjectOpen,
      projectModalOpen,
      selectedProjectId,
      artistSelectionOpen,
      assigningProjectId
    };
    sessionStorage.setItem('client_dashboard_ui_state', JSON.stringify(uiState));

  }, [selectedTab, createProjectOpen, projectModalOpen, selectedProjectId, artistSelectionOpen, assigningProjectId]);

  // Scroll Position Tracking
  useEffect(() => {
    const handleScroll = () => {
      if (selectedTab) {
        sessionStorage.setItem(`client_dashboard_scroll_${selectedTab}`, window.scrollY.toString());
      }
    };

    // Simple debounce
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
  }, [selectedTab]);

  // Real-time subscription for projects
  useEffect(() => {
    if (!user?.id) return;
    const projectsChannel = supabase.channel(`client-projects-${user.id}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `client_id=eq.${user.id}`
    }, payload => {
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
  const handleUnassignArtist = async (projectId: string) => {
    const key = `unassign-${projectId}`;
    if (buttonLoading[key]) return;
    setButtonLoading(prev => ({ ...prev, [key]: true }));
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          artist_id: null,
          status: 'pending',
          is_locked: false
        })
        .eq('id', projectId);

      if (error) throw error;
      
      toast.success('Artist unassigned successfully');
      fetchProjects();
    } catch (err: any) {
      const msg = err?.code === 'PGRST301' ? 'Permission denied. You can only edit your own projects.'
        : err?.code === '23505' ? 'Duplicate entry — this artist is already assigned.'
        : err?.message || 'Failed to unassign artist';
      toast.error(msg);
    } finally {
      setButtonLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleConfirmProject = async (projectId: string, artistId: string) => {
    const key = `confirm-${projectId}`;
    if (buttonLoading[key]) return;
    setButtonLoading(prev => ({ ...prev, [key]: true }));
    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ is_locked: true })
        .eq('id', projectId);

      if (updateError) {
        if (updateError.code === 'PGRST301') throw new Error('Permission denied — you can only confirm your own projects.');
        throw updateError;
      }

      const { error: notifyError } = await supabase.from('notifications').insert({
        user_id: artistId,
        title: 'New Project Request',
        message: 'You have received a new project request.',
        type: 'project',
        metadata: { projectId }
      });

      if (notifyError) throw notifyError;
      
      toast.success('Project sent to artist for approval');
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm project');
    } finally {
      setButtonLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleArtistSelected = async (artistId: string) => {
    if (!assigningProjectId) return;
    const key = `assign-${assigningProjectId}`;
    if (buttonLoading[key]) return;
    setButtonLoading(prev => ({ ...prev, [key]: true }));
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          artist_id: artistId,
          status: 'pending',
          is_locked: false
        })
        .eq('id', assigningProjectId);

      if (error) throw error;
      
      toast.success('Artist assigned successfully. Click confirm to send project.');
      setArtistSelectionOpen(false);
      setAssigningProjectId(null);
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign artist');
    } finally {
      setButtonLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const activeProjects = projects.filter(p => ["In Progress", "Review", "Pending Artist", "Pending Confirm", "Draft"].includes(p.status));
  const completedProjects = projects.filter(p => p.status === "Completed");
  const rejectedProjects = projects.filter(p => p.status === "Rejected");
  // Real profile name — fallback chain: full_name → email prefix → 'there'
  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  // Filtered projects for the search box in projects tab
  const searchedActiveProjects = projectSearch
    ? activeProjects.filter(p =>
        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.artist.toLowerCase().includes(projectSearch.toLowerCase())
      )
    : activeProjects;
  const searchedCompletedProjects = projectSearch
    ? completedProjects.filter(p =>
        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.artist.toLowerCase().includes(projectSearch.toLowerCase())
      )
    : completedProjects;

  return <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 pt-28 sm:pt-32 lg:pt-36">
        {/* Dashboard Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
          <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black mb-1 sm:mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
            Welcome back, <span className="font-black text-foreground">{userName}</span>! Manage your projects and discover new artists.
          </p>
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

        {/* Dashboard Navigation - Optimized for all screens */}
        <Tabs value={selectedTab} className="mb-4 sm:mb-6 lg:mb-8" onValueChange={handleTabChange}>
          <div className="relative mb-4 sm:mb-6 group">
            <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 pb-4">
              <TabsList className="bg-white/80 dark:bg-card/80 backdrop-blur-md inline-flex sm:flex sm:flex-wrap lg:grid lg:grid-cols-5 xl:grid-cols-10 gap-2 p-1.5 rounded-[1.5rem] shadow-xl border border-border/40 min-w-full sm:min-w-0 h-auto min-h-[80px] sm:min-h-0">
                <TabsTrigger 
                  value="overview" 
                  disabled={profileIncomplete} 
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                    "hover:bg-primary/5 hover:text-primary", 
                    profileIncomplete && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                  )}
                >
                  <LayoutDashboard className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                  <span className="font-bold sm:font-medium">Overview</span>
                  {profileIncomplete && <Lock className="h-3 w-3 ml-0.5" />}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="profile" 
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                    "hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <User className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                  <span className="font-bold sm:font-medium">Profile</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="projects" 
                  disabled={profileIncomplete} 
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                    "hover:bg-primary/5 hover:text-primary", 
                    profileIncomplete && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                  )}
                >
                  <FileText className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                  <span className="font-bold sm:font-medium">Projects</span>
                  {profileIncomplete && <Lock className="h-3 w-3 ml-0.5" />}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="collection" 
                  disabled={profileIncomplete} 
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                    "hover:bg-primary/5 hover:text-primary", 
                    profileIncomplete && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                  )}
                >
                  <ShoppingBag className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                  <span className="font-bold sm:font-medium whitespace-nowrap">Collection</span>
                  {profileIncomplete && <Lock className="h-3 w-3 ml-0.5" />}
                </TabsTrigger>

                <TabsTrigger 
                  value="messages" 
                  disabled={profileIncomplete} 
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                    "hover:bg-primary/5 hover:text-primary", 
                    profileIncomplete && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                  )}
                >
                  <MessageSquare className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                  <span className="font-bold sm:font-medium">Messages</span>
                  {profileIncomplete && <Lock className="h-3 w-3 ml-0.5" />}
                </TabsTrigger>

                <TabsTrigger 
                  value="saved" 
                  disabled={profileIncomplete} 
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                    "hover:bg-primary/5 hover:text-primary", 
                    profileIncomplete && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                  )}
                >
                  <Bookmark className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                  <span className="font-bold sm:font-medium">Saved</span>
                  {profileIncomplete && <Lock className="h-3 w-3 ml-0.5" />}
                </TabsTrigger>

                <TabsTrigger 
                  value="artists" 
                  disabled={profileIncomplete} 
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                    "hover:bg-primary/5 hover:text-primary", 
                    profileIncomplete && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                  )}
                >
                  <Users className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                  <span className="font-bold sm:font-medium">Saved Artists</span>
                  {profileIncomplete && <Lock className="h-3 w-3 ml-0.5" />}
                </TabsTrigger>

                <TabsTrigger 
                  value="ratings" 
                  disabled={profileIncomplete} 
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                    "hover:bg-primary/5 hover:text-primary", 
                    profileIncomplete && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                  )}
                >
                  <Star className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                  <span className="font-bold sm:font-medium">Reviews</span>
                  {profileIncomplete && <Lock className="h-3 w-3 ml-0.5" />}
                </TabsTrigger>

                <TabsTrigger 
                  value="payments" 
                  disabled={profileIncomplete} 
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                    "hover:bg-primary/5 hover:text-primary", 
                    profileIncomplete && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                  )}
                >
                  <CreditCard className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                  <span className="font-bold sm:font-medium">Payments</span>
                  {profileIncomplete && <Lock className="h-3 w-3 ml-0.5" />}
                </TabsTrigger>

                <TabsTrigger 
                  value="settings" 
                  disabled={profileIncomplete}
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0", 
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30", 
                    "hover:bg-primary/5 hover:text-primary",
                    profileIncomplete && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
                  )}
                >
                  <Settings className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                  <span className="font-bold sm:font-medium">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Fade indicators for scrolling */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-50/50 to-transparent pointer-events-none sm:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-purple-50/50 to-transparent pointer-events-none sm:hidden" />
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in outline-none">
            {/* Stats Row - Modernized & Clickable Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
              <div 
                onClick={() => handleTabChange('projects')}
                className="group relative bg-white/80 dark:bg-card/80 backdrop-blur-sm p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-blue-100/50 dark:border-border overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer"
              >
                <div className="absolute -top-2 -right-2 p-4 opacity-5 sm:opacity-10 transition-opacity group-hover:opacity-20">
                  <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 sm:gap-3 mb-1 sm:mb-3">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Clock className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="font-semibold text-[10px] sm:text-xs lg:text-sm text-muted-foreground uppercase tracking-tight sm:tracking-wider truncate">Active</h3>
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <p className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {activeProjects.length}
                    </p>
                    <span className="hidden xs:inline text-[8px] sm:text-xs text-muted-foreground font-medium">Projects</span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => handleTabChange('projects')}
                className="group relative bg-white/80 dark:bg-card/80 backdrop-blur-sm p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-emerald-100/50 dark:border-border overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer"
              >
                <div className="absolute -top-2 -right-2 p-4 opacity-5 sm:opacity-10 transition-opacity group-hover:opacity-20">
                  <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-600" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 sm:gap-3 mb-1 sm:mb-3">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="font-semibold text-[10px] sm:text-xs lg:text-sm text-muted-foreground uppercase tracking-tight sm:tracking-wider truncate">Done</h3>
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <p className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {completedProjects.length}
                    </p>
                    <span className="hidden xs:inline text-[8px] sm:text-xs text-muted-foreground font-medium">Projects</span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => handleTabChange('artists')}
                className="group relative bg-white/80 dark:bg-card/80 backdrop-blur-sm p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-purple-100/50 dark:border-border overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer"
              >
                <div className="absolute -top-2 -right-2 p-4 opacity-5 sm:opacity-10 transition-opacity group-hover:opacity-20">
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-fuchsia-500/5 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 sm:gap-3 mb-1 sm:mb-3">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <Users className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="font-semibold text-[10px] sm:text-xs lg:text-sm text-muted-foreground uppercase tracking-tight sm:tracking-wider truncate">Saved</h3>
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <p className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                      {savedArtistsCount}
                    </p>
                    <span className="hidden xs:inline text-[8px] sm:text-xs text-muted-foreground font-medium">Artists</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Active Projects Section - Larger */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-heading text-lg lg:text-xl font-bold flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Active Projects
                  </h2>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 transition-colors" onClick={() => setSelectedTab('projects')}>
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {activeProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 px-6 rounded-[2.5rem] border-2 border-dashed border-border/40 bg-muted/20 backdrop-blur-sm">
                      <div className="rounded-[1.5rem] bg-muted/50 p-5 mb-5 shadow-inner">
                        <FileText className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-lg font-black text-foreground mb-1.5 tracking-tight">No active projects yet</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-xs mb-6 font-medium leading-relaxed opacity-70">
                        Bring your vision to life. Create a project and connect with talented artists.
                      </p>
                      <Button onClick={() => setCreateProjectOpen(true)} className="gap-2 h-11 px-7 rounded-2xl font-black shadow-lg shadow-primary/20">
                        <PlusCircle className="h-4 w-4" />
                        Create Project
                      </Button>
                    </div>
                  ) : (
                    activeProjects.slice(0, 3).map((project, index) => (
                      <div key={project.id} className="group bg-white/80 dark:bg-card/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-muted/30 hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={cn(
                                "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm",
                                project.status === "In Progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                                project.status === "Pending Artist" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                                project.status === "Pending Confirm" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" :
                                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              )}>
                                {project.status}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Due {project.dueDate}
                              </span>
                            </div>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate mb-1">{project.title}</h3>
                            <div className="flex items-center gap-2 mb-4">
                              <img src={project.artistAvatar} alt={project.artist} className="h-5 w-5 rounded-full object-cover" />
                              <span className="text-sm text-muted-foreground">Artist: <span className="text-foreground font-medium">{project.artist}</span></span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-muted-foreground">Progress</span>
                                <span className="font-bold text-primary">{project.progress}%</span>
                              </div>
                              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                  style={{ width: `${project.progress}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center">
                            <Button size="sm" variant="outline" className="rounded-xl px-4 hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => {
                              setSelectedProjectId(project.id);
                              setProjectModalOpen(true);
                            }}>
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar: Recommendations & Notifications */}
              <div className="space-y-6 lg:space-y-8">
                {/* Recommended Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-heading text-lg font-bold flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      Artists
                    </h2>
                    <Link to="/explore" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      Explore <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {recommendedArtists.slice(0, 3).map((artist, index) => (
                      <Link key={artist.id} to={`/artist/${artist.id}`} className="group bg-white/70 dark:bg-card/70 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-muted/20 hover:shadow-md hover:border-primary/20 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img src={artist.profileImage} alt={artist.name} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white dark:ring-border group-hover:ring-primary/50 transition-all" />
                            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-[8px] font-bold text-white px-1 rounded flex items-center gap-0.5 shadow-sm">
                              <Star className="h-2 w-2 fill-white" /> {artist.rating}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{artist.name}</h3>
                            <p className="text-xs text-muted-foreground truncate font-medium">{artist.profession}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Notifications Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-heading text-lg font-bold flex items-center gap-2">
                      <Bell className="h-5 w-5 text-blue-500" />
                      Activity
                    </h2>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-muted-foreground" onClick={() => setSelectedTab('settings')}>
                      Manage
                    </Button>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-card/70 backdrop-blur-sm rounded-2xl shadow-sm border border-muted/20 overflow-hidden">
                    <div className="divide-y divide-muted/10">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                          <Bell className="h-6 w-6 opacity-20" />
                          <p>No new updates</p>
                        </div>
                      ) : (
                        notifications.slice(0, 4).map((notification, index) => (
                          <div key={notification.id} className={cn(
                            "p-4 flex items-start gap-3 transition-colors hover:bg-muted/5 animate-fade-in",
                            !notification.read && "bg-blue-50/30 dark:bg-blue-900/10"
                          )} style={{ animationDelay: `${index * 30}ms` }}>
                            {!notification.read && <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium leading-relaxed line-clamp-2">{notification.content}</p>
                              <p className="text-[10px] text-muted-foreground mt-1 font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {notification.time}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Collection Tab */}
          <TabsContent value="collection" className="animate-fade-in">
            <PurchasedArtworks />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="font-heading text-base sm:text-lg lg:text-xl font-black uppercase tracking-tight">All Projects</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={e => setProjectSearch(e.target.value)}
                    className="w-full sm:w-48 lg:w-64 pl-9 pr-4 py-2.5 border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-transparent bg-white/80 dark:bg-card/80 min-h-[44px]"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </div>
                </div>
                <Button className="w-full sm:w-auto text-sm min-h-[44px]" onClick={() => setCreateProjectOpen(true)}>
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
                  {projectSearch && <span className="ml-2 text-xs font-normal text-muted-foreground">({searchedActiveProjects.length} result{searchedActiveProjects.length !== 1 ? 's' : ''})</span>}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {searchedActiveProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-[2rem] border-2 border-dashed border-border/30 bg-muted/10">
                      <div className="rounded-2xl bg-muted/40 p-4 mb-4">
                        <Clock className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm font-black text-foreground mb-1">{projectSearch ? 'No matches' : 'No active projects'}</p>
                      <p className="text-xs text-muted-foreground text-center mb-4">{projectSearch ? 'Try a different search term.' : 'Create a project to get started.'}</p>
                      {!projectSearch && (
                        <Button size="sm" onClick={() => setCreateProjectOpen(true)} className="h-9 px-5 rounded-xl font-black text-xs shadow-sm shadow-primary/20">
                          <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> New Project
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      {searchedActiveProjects.slice(0, visibleActive).map((project, index) => <div key={project.id} className="p-3 sm:p-4 border border-gray-100 dark:border-border rounded-lg bg-white/70 dark:bg-card/70 transition-all duration-300 hover:shadow-md animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
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
                                    {format(project.budget)}
                                  </span>}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                  <Button size="sm" variant="outline" className="h-7 sm:h-8 text-xs" onClick={() => {
                                    setSelectedProjectId(project.id);
                                    setProjectModalOpen(true);
                                  }}>
                                    View
                                  </Button>
                                  
                                  {(project.status === 'Draft' || project.status === 'Pending Confirm') && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-9 sm:h-10 min-w-[44px] text-xs border-primary text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                                        disabled={!!buttonLoading[`assign-${project.id}`]}
                                        onClick={() => {
                                          setAssigningProjectId(project.id);
                                          setArtistSelectionOpen(true);
                                        }}
                                      >
                                        {buttonLoading[`assign-${project.id}`] ? (
                                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        ) : (
                                          project.status === 'Draft' ? 'Assign Artist' : 'Reassign'
                                        )}
                                      </Button>

                                      {project.status === 'Pending Confirm' && (
                                        <>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-9 sm:h-10 min-w-[44px] text-xs text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-1"
                                            disabled={!!buttonLoading[`unassign-${project.id}`]}
                                            onClick={() => handleUnassignArtist(project.id)}
                                          >
                                            {buttonLoading[`unassign-${project.id}`] ? (
                                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                                            ) : 'Unassign'}
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            className="h-9 sm:h-10 min-w-[44px] text-xs bg-primary text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                                            disabled={!!buttonLoading[`confirm-${project.id}`]}
                                            onClick={() => handleConfirmProject(project.id, project.artistId)}
                                          >
                                            {buttonLoading[`confirm-${project.id}`] ? (
                                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : 'Confirm'}
                                          </Button>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                          </div>
                        </div>)}

                      {/* Load More — Active */}
                      {visibleActive < searchedActiveProjects.length && (
                        <div className="flex justify-center pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-8 rounded-xl font-black text-xs uppercase tracking-widest border-primary/20 hover:bg-primary/5"
                            onClick={() => setVisibleActive(v => v + PROJECTS_PER_PAGE)}
                          >
                            Load More · {Math.min(PROJECTS_PER_PAGE, searchedActiveProjects.length - visibleActive)} of {searchedActiveProjects.length - visibleActive} remaining
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border">
                <h3 className="font-heading text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                  Completed
                  {projectSearch && <span className="ml-2 text-xs font-normal text-muted-foreground">({searchedCompletedProjects.length} result{searchedCompletedProjects.length !== 1 ? 's' : ''})</span>}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {searchedCompletedProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-[2rem] border-2 border-dashed border-border/30 bg-muted/10">
                      <div className="rounded-2xl bg-muted/40 p-4 mb-4">
                        <CheckCircle className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm font-black text-foreground mb-1">{projectSearch ? 'No matches' : 'No completed projects'}</p>
                      <p className="text-xs text-muted-foreground text-center">{projectSearch ? 'Try a different search term.' : 'Completed projects will appear here.'}</p>
                    </div>
                  ) : (
                    <>
                      {searchedCompletedProjects.slice(0, visibleCompleted).map((project, index) => <div key={project.id} className="p-3 sm:p-4 border border-gray-100 dark:border-border rounded-lg bg-white/70 dark:bg-card/70 transition-all duration-300 hover:shadow-md animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
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
                                    {format(project.budget)}
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

                      {/* Load More — Completed */}
                      {visibleCompleted < searchedCompletedProjects.length && (
                        <div className="flex justify-center pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-8 rounded-xl font-black text-xs uppercase tracking-widest border-primary/20 hover:bg-primary/5"
                            onClick={() => setVisibleCompleted(v => v + PROJECTS_PER_PAGE)}
                          >
                            Load More · {Math.min(PROJECTS_PER_PAGE, searchedCompletedProjects.length - visibleCompleted)} of {searchedCompletedProjects.length - visibleCompleted} remaining
                          </Button>
                        </div>
                      )}
                    </>
                  )}
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
            <DialogDescription>Fill in the details to create a new project.</DialogDescription>
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
      <ArtistSelectionModal 
        isOpen={artistSelectionOpen}
        onClose={() => {
          setArtistSelectionOpen(false);
          setAssigningProjectId(null);
        }}
        onSelectArtist={handleArtistSelected}
      />
    </div>;
};
export default ClientDashboard;
