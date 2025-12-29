
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, MessageSquare, FileText, Settings, CreditCard, Heart, Bell, ChevronRight, Search, CheckCircle, Clock, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import SavedArtists from "@/components/dashboard/SavedArtists";
import ClientMessages from "@/components/dashboard/ClientMessages";
import ProjectRating from "@/components/dashboard/ProjectRating";
import ClientPayments from "@/components/dashboard/ClientPayments";
import ClientSettings from "@/components/dashboard/ClientSettings";
import UniversalChatbot from '@/components/UniversalChatbot';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  artist: string;
  dueDate: string;
  completedDate?: string;
  progress: number;
  status: string;
  rating?: number;
}

// Mock data for recommended artists
const recommendedArtists = [{
  id: "a1",
  name: "Emma Williams",
  profession: "Photographer",
  rating: 4.9,
  profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
}, {
  id: "a2",
  name: "Daniel Chen",
  profession: "3D Animator",
  rating: 4.8,
  profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
}, {
  id: "a3",
  name: "Sophia Rodriguez",
  profession: "Voice Artist",
  rating: 4.7,
  profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
}];

const ClientDashboard = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [savedArtistsCount, setSavedArtistsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, artist:artist_id(full_name)`)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProjects: Project[] = (data || []).map((project: any) => ({
        id: project.id,
        title: project.title,
        artist: project.artist?.full_name || 'Unassigned',
        dueDate: project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline',
        completedDate: project.status === 'completed' ? new Date(project.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
        progress: project.status === 'completed' ? 100 : project.status === 'accepted' ? 50 : 10,
        status: project.status === 'accepted' ? 'In Progress' : project.status === 'completed' ? 'Completed' : project.status === 'pending' ? 'Pending' : 'Review',
        rating: 0,
      }));

      setProjects(transformedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    setNotifications((data || []).map(n => ({
      id: n.id,
      content: n.message,
      time: new Date(n.created_at).toLocaleDateString(),
      read: n.is_read,
    })));
  }, [user?.id]);

  const fetchSavedArtistsCount = useCallback(async () => {
    if (!user?.id) return;

    const { count } = await supabase
      .from('saved_artists')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id);

    setSavedArtistsCount(count || 0);
  }, [user?.id]);

  useEffect(() => {
    fetchProjects();
    fetchNotifications();
    fetchSavedArtistsCount();
  }, [fetchProjects, fetchNotifications, fetchSavedArtistsCount]);

  // Real-time subscription for projects
  useEffect(() => {
    if (!user?.id) return;

    const projectsChannel = supabase
      .channel(`client-projects-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `client_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Project update received:', payload.eventType);
          fetchProjects();
          if (payload.eventType === 'UPDATE') {
            toast.success('Project status updated!');
          }
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel(`client-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
          toast.info('New notification received!');
        }
      )
      .subscribe();

    const savedArtistsChannel = supabase
      .channel(`client-saved-artists-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_artists',
          filter: `client_id=eq.${user.id}`
        },
        () => {
          fetchSavedArtistsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(savedArtistsChannel);
    };
  }, [user?.id, fetchProjects, fetchNotifications, fetchSavedArtistsCount]);

  const activeProjects = projects.filter(p => p.status === "In Progress" || p.status === "Review" || p.status === "Pending");
  const completedProjects = projects.filter(p => p.status === "Completed");
  
  const userName = 'there';
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pt-16 sm:pt-20">
        {/* Dashboard Header - Mobile optimized */}
        <div className="mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
          <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">Welcome back, {userName}! Manage your projects and discover new artists.</p>
        </div>

        {/* Dashboard Navigation - Horizontal scroll on mobile */}
        <Tabs defaultValue="overview" className="mb-4 sm:mb-6 lg:mb-8" onValueChange={setSelectedTab}>
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 mb-4 sm:mb-6 scrollbar-hide">
            <TabsList className="bg-white/50 dark:bg-card/50 backdrop-blur-sm inline-flex min-w-max sm:grid sm:grid-cols-7 gap-1 p-1">
              <TabsTrigger 
                value="overview" 
                className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "hover:bg-muted/50"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "hover:bg-muted/50"
                )}
              >
                <FileText className="h-4 w-4" />
                <span>Projects</span>
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "hover:bg-muted/50"
                )}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </TabsTrigger>
              <TabsTrigger 
                value="artists" 
                className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "hover:bg-muted/50"
                )}
              >
                <Heart className="h-4 w-4" />
                <span>Artists</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ratings" 
                className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "hover:bg-muted/50"
                )}
              >
                <Star className="h-4 w-4" />
                <span>Reviews</span>
              </TabsTrigger>
              <TabsTrigger 
                value="payments" 
                className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "hover:bg-muted/50"
                )}
              >
                <CreditCard className="h-4 w-4" />
                <span>Payments</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-md transition-all duration-200",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "hover:bg-muted/50"
                )}
              >
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
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex justify-between items-center gap-2 mb-3 sm:mb-4">
                <h2 className="font-heading text-base sm:text-lg lg:text-xl font-semibold">Active Projects</h2>
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm h-8 sm:h-9">
                  <Link to="/projects">View All</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {activeProjects.length === 0 ? (
                  <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-6 rounded-xl text-center text-muted-foreground">
                    No active projects yet
                  </div>
                ) : (
                  activeProjects.slice(0, 3).map((project, index) => (
                    <div 
                      key={project.id} 
                      className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border hover:shadow-md transition-all duration-300 hover:scale-[1.01] animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                          <h3 className="font-medium text-sm sm:text-base truncate">{project.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">Artist: {project.artist}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-gray-200 dark:bg-muted rounded-full h-1.5 sm:h-2">
                              <div 
                                className="bg-gradient-to-r from-artswarit-purple to-blue-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium min-w-[30px]">{project.progress}%</span>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 w-full sm:w-auto justify-between sm:justify-start">
                          <span className="text-[10px] sm:text-xs text-gray-500 order-2 sm:order-1">Due: {project.dueDate}</span>
                          <span className={cn(
                            "inline-block px-2 py-0.5 text-[10px] sm:text-xs rounded-full order-1 sm:order-2",
                            project.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          )}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recommended Artists */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
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
                {recommendedArtists.map((artist, index) => (
                  <Link 
                    key={artist.id} 
                    to={`/artist/${artist.id}`} 
                    className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={artist.profileImage} 
                        alt={artist.name} 
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-white dark:ring-border" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{artist.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{artist.profession}</p>
                      </div>
                      <div className="flex items-center shrink-0">
                        <span className="text-yellow-500">★</span>
                        <span className="text-xs sm:text-sm font-medium ml-1">{artist.rating}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex justify-between items-center gap-2 mb-3 sm:mb-4">
                <h2 className="font-heading text-base sm:text-lg lg:text-xl font-semibold">Notifications</h2>
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Manage</span>
                </Button>
              </div>
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border divide-y divide-gray-100 dark:divide-border">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "p-3 sm:p-4 flex items-start gap-2 sm:gap-3 transition-colors duration-200 animate-fade-in",
                        notification.read ? '' : 'bg-blue-50/40 dark:bg-blue-900/10'
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className={cn(
                        "mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0 transition-colors",
                        notification.read ? 'bg-transparent' : 'bg-blue-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm line-clamp-2">{notification.content}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="font-heading text-base sm:text-lg lg:text-xl font-semibold">All Projects</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input 
                    type="text" 
                    placeholder="Search projects..." 
                    className="w-full sm:w-48 lg:w-64 pl-9 pr-4 py-2 border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-transparent bg-white/80 dark:bg-card/80" 
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </div>
                </div>
                <Button className="w-full sm:w-auto text-sm">New Project</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border">
                <h3 className="font-heading text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-600" />
                  In Progress
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {activeProjects.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No active projects</p>
                  ) : (
                    activeProjects.map((project, index) => (
                      <div 
                        key={project.id} 
                        className="p-3 sm:p-4 border border-gray-100 dark:border-border rounded-lg bg-white/70 dark:bg-card/70 transition-all duration-300 hover:shadow-md animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-medium text-sm sm:text-base truncate flex-1">{project.title}</h4>
                          <span className={cn(
                            "px-2 py-0.5 text-[10px] sm:text-xs rounded-full shrink-0",
                            project.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          )}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Artist: {project.artist}</p>
                        <div className="flex items-center gap-2 mt-2 sm:mt-3">
                          <div className="flex-1 bg-gray-200 dark:bg-muted rounded-full h-1.5 sm:h-2">
                            <div 
                              className="bg-gradient-to-r from-artswarit-purple to-blue-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] sm:text-xs font-medium">{project.progress}%</span>
                        </div>
                        <div className="mt-2 sm:mt-3 flex justify-between items-center">
                          <span className="text-[10px] sm:text-xs text-gray-500">Due: {project.dueDate}</span>
                          <Button size="sm" variant="outline" className="h-7 sm:h-8 text-xs">View</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-blue-100 dark:border-border">
                <h3 className="font-heading text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                  Completed
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {completedProjects.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No completed projects</p>
                  ) : (
                    completedProjects.map((project, index) => (
                      <div 
                        key={project.id} 
                        className="p-3 sm:p-4 border border-gray-100 dark:border-border rounded-lg bg-white/70 dark:bg-card/70 transition-all duration-300 hover:shadow-md animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-medium text-sm sm:text-base truncate flex-1">{project.title}</h4>
                          <div className="flex shrink-0">
                            {[...Array(project.rating || 0)].map((_, i) => (
                              <span key={i} className="text-yellow-400 text-xs sm:text-sm">★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Artist: {project.artist}</p>
                        <div className="mt-2 sm:mt-3 flex justify-between items-center">
                          <span className="text-[10px] sm:text-xs text-gray-500">Completed: {project.completedDate}</span>
                          <Button size="sm" variant="outline" className="h-7 sm:h-8 text-xs">View</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Messages Tab */}
          <TabsContent value="messages" className="animate-fade-in">
            <ClientMessages />
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
      <UniversalChatbot />
    </div>
  );
};

export default ClientDashboard;
