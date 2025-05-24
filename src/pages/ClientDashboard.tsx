import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, MessageSquare, FileText, Settings, CreditCard, Heart, Bell, ChevronRight, Search, CheckCircle, Clock, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import SavedArtists from "@/components/dashboard/SavedArtists";
import ClientMessages from "@/components/dashboard/ClientMessages";
import ProjectRating from "@/components/dashboard/ProjectRating";
import ClientPayments from "@/components/dashboard/ClientPayments";

// Mock data for projects
const activeProjects = [{
  id: "p1",
  title: "Album Cover Design",
  artist: "Maya Johnson",
  dueDate: "May 28, 2025",
  progress: 75,
  status: "In Progress"
}, {
  id: "p2",
  title: "Voice Over for Ad",
  artist: "Alex Rivera",
  dueDate: "May 20, 2025",
  progress: 40,
  status: "In Progress"
}, {
  id: "p3",
  title: "Script Editing",
  artist: "Jordan Smith",
  dueDate: "May 25, 2025",
  progress: 90,
  status: "Review"
}];
const completedProjects = [{
  id: "p4",
  title: "Logo Design",
  artist: "Taylor Reed",
  completedDate: "May 10, 2025",
  rating: 5
}, {
  id: "p5",
  title: "Podcast Intro",
  artist: "Alex Rivera",
  completedDate: "April 30, 2025",
  rating: 4
}];

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

// Active notifications
const notifications = [{
  id: "n1",
  content: "Maya Johnson submitted new work for 'Album Cover Design'",
  time: "2 hours ago",
  read: false
}, {
  id: "n2",
  content: "Project deadline approaching for 'Voice Over for Ad'",
  time: "5 hours ago",
  read: false
}, {
  id: "n3",
  content: "Jordan Smith sent you a message",
  time: "1 day ago",
  read: true
}];
const ClientDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  return <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-[84px]">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Thomas! Manage your projects and discover new artists.</p>
        </div>

        {/* Dashboard Navigation */}
        <Tabs defaultValue="overview" className="mb-8" onValueChange={setSelectedTab}>
          <div className="overflow-x-auto">
            <TabsList className="bg-white/50 backdrop-blur-sm mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="artists" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Saved Artists
              </TabsTrigger>
              <TabsTrigger value="ratings" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Active Projects</h3>
                <p className="text-3xl font-bold">{activeProjects.length}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Completed Projects</h3>
                <p className="text-3xl font-bold">{completedProjects.length}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Saved Artists</h3>
                <p className="text-3xl font-bold">12</p>
              </div>
            </div>

            {/* Active Projects Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading text-xl font-semibold">Active Projects</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/projects">View All</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {activeProjects.map(project => <div key={project.id} className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">Artist: {project.artist}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-artswarit-purple to-blue-500 h-2 rounded-full" style={{
                          width: `${project.progress}%`
                        }}></div>
                          </div>
                          <span className="text-xs font-medium">{project.progress}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Due: {project.dueDate}</span>
                        <div className="mt-1">
                          {project.status === "In Progress" ? <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">In Progress</span> : <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Review</span>}
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>

            {/* Recommended Artists */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading text-xl font-semibold">Recommended for You</h2>
                <Button variant="ghost" size="sm" asChild className="text-artswarit-purple">
                  <Link to="/explore" className="flex items-center">
                    Explore More
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedArtists.map(artist => <Link key={artist.id} to={`/artist/${artist.id}`} className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <img src={artist.profileImage} alt={artist.name} className="h-12 w-12 rounded-full object-cover" />
                      <div>
                        <h3 className="font-medium">{artist.name}</h3>
                        <p className="text-sm text-muted-foreground">{artist.profession}</p>
                      </div>
                      <div className="ml-auto flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium ml-1">{artist.rating}</span>
                      </div>
                    </div>
                  </Link>)}
              </div>
            </div>

            {/* Recent Notifications */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading text-xl font-semibold">Recent Notifications</h2>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4 mr-1" />
                  <span>Manage</span>
                </Button>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100 divide-y">
                {notifications.map(notification => <div key={notification.id} className={`p-4 flex items-start gap-3 ${notification.read ? '' : 'bg-blue-50/40'}`}>
                    <div className={`mt-1 h-2 w-2 rounded-full ${notification.read ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>)}
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab (simplified) */}
          <TabsContent value="projects" className="space-y-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-xl font-semibold">All Projects</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <input type="text" placeholder="Search projects..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-transparent bg-white/80" />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </div>
                </div>
                <Button>New Project</Button>
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
          
          {/* Saved Artists Tab */}
          <TabsContent value="artists">
            <SavedArtists />
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings">
            <ProjectRating />
          </TabsContent>
          
          {/* Payments Tab */}
          <TabsContent value="payments">
            <ClientPayments />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-blue-100 text-center py-20">
              <h3 className="font-heading text-xl font-semibold mb-2">Account Settings</h3>
              <p className="text-muted-foreground mb-4">Manage your profile, preferences, and account settings.</p>
              <Button>Edit Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default ClientDashboard;
