
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
import UniversalChatbot from '@/components/UniversalChatbot';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

  useEffect(() => {
    fetchProjects();
    fetchNotifications();
  }, [fetchProjects, fetchNotifications]);

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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user?.id, fetchProjects, fetchNotifications]);

  const activeProjects = projects.filter(p => p.status === "In Progress" || p.status === "Review" || p.status === "Pending");
  const completedProjects = projects.filter(p => p.status === "Completed");
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 pt-20 sm:pt-[84px]">
        {/* Dashboard Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Welcome back, Thomas! Manage your projects and discover new artists.</p>
        </div>

        {/* Dashboard Navigation */}
        <Tabs defaultValue="overview" className="mb-6 sm:mb-8" onValueChange={setSelectedTab}>
          <div className="overflow-x-auto mb-4 sm:mb-6">
            <TabsList className="bg-white/50 backdrop-blur-sm grid grid-cols-3 sm:grid-cols-7 min-w-[500px] sm:min-w-0">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Overview</span>
                <span className="xs:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Projects</span>
                <span className="xs:hidden">Proj</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Messages</span>
                <span className="xs:hidden">Msg</span>
              </TabsTrigger>
              <TabsTrigger value="artists" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Saved Artists</span>
                <span className="xs:hidden">Artists</span>
              </TabsTrigger>
              <TabsTrigger value="ratings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Reviews</span>
                <span className="xs:hidden">Rate</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Payments</span>
                <span className="xs:hidden">Pay</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Settings</span>
                <span className="xs:hidden">Set</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-medium text-xs sm:text-sm text-muted-foreground mb-2">Active Projects</h3>
                <p className="text-2xl sm:text-3xl font-bold">{activeProjects.length}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-medium text-xs sm:text-sm text-muted-foreground mb-2">Completed Projects</h3>
                <p className="text-2xl sm:text-3xl font-bold">{completedProjects.length}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-medium text-xs sm:text-sm text-muted-foreground mb-2">Saved Artists</h3>
                <p className="text-2xl sm:text-3xl font-bold">12</p>
              </div>
            </div>

            {/* Active Projects Section */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <h2 className="font-heading text-lg sm:text-xl font-semibold">Active Projects</h2>
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <Link to="/projects">View All</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {activeProjects.map(project => (
                  <div key={project.id} className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{project.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Artist: {project.artist}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-artswarit-purple to-blue-500 h-2 rounded-full" 
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium min-w-[35px]">{project.progress}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Due: {project.dueDate}</span>
                        <div className="mt-1">
                          {project.status === "In Progress" ? (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">In Progress</span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Review</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Artists */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <h2 className="font-heading text-lg sm:text-xl font-semibold">Recommended for You</h2>
                <Button variant="ghost" size="sm" asChild className="text-artswarit-purple w-full sm:w-auto">
                  <Link to="/explore" className="flex items-center justify-center sm:justify-start">
                    Explore More
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {recommendedArtists.map(artist => (
                  <Link 
                    key={artist.id} 
                    to={`/artist/${artist.id}`} 
                    className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img 
                        src={artist.profileImage} 
                        alt={artist.name} 
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{artist.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{artist.profession}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="text-xs sm:text-sm font-medium ml-1">{artist.rating}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Notifications */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <h2 className="font-heading text-lg sm:text-xl font-semibold">Recent Notifications</h2>
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                  <Bell className="h-4 w-4 mr-1" />
                  <span>Manage</span>
                </Button>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100 divide-y">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 sm:p-4 flex items-start gap-3 ${notification.read ? '' : 'bg-blue-50/40'}`}
                  >
                    <div className={`mt-1 h-2 w-2 rounded-full ${notification.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <h2 className="font-heading text-lg sm:text-xl font-semibold">All Projects</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search projects..." 
                    className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-transparent bg-white/80" 
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </div>
                </div>
                <Button className="w-full sm:w-auto">New Project</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-amber-600" />
                  In Progress
                </h3>
                <div className="space-y-4">
                  {activeProjects.map(project => <div key={project.id} className="p-4 border border-gray-100 rounded-lg bg-white/70">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{project.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${project.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Artist: {project.artist}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-artswarit-purple to-blue-500 h-2 rounded-full" style={{
                        width: `${project.progress}%`
                      }}></div>
                        </div>
                        <span className="text-xs font-medium">{project.progress}%</span>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Due: {project.dueDate}</span>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>)}
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Completed
                </h3>
                <div className="space-y-4">
                  {completedProjects.map(project => <div key={project.id} className="p-4 border border-gray-100 rounded-lg bg-white/70">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{project.title}</h4>
                        <div className="flex">
                          {[...Array(project.rating)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Artist: {project.artist}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Completed: {project.completedDate}</span>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>)}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Messages Tab */}
          <TabsContent value="messages">
            <ClientMessages />
          </TabsContent>
          
          <TabsContent value="artists">
            <SavedArtists />
          </TabsContent>

          <TabsContent value="ratings">
            <ProjectRating />
          </TabsContent>
          
          <TabsContent value="payments">
            <ClientPayments />
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-blue-100 text-center py-20">
              <h3 className="font-heading text-xl font-semibold mb-2">Account Settings</h3>
              <p className="text-muted-foreground mb-4">Manage your profile, preferences, and account settings.</p>
              <Button>Edit Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <UniversalChatbot />
    </div>
  );
};

export default ClientDashboard;
