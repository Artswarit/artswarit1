import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, MessageSquare, FileText, Settings, CreditCard, Heart, Bell, ChevronRight, Search, CheckCircle, Clock, Star, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import SavedArtists from "@/components/dashboard/SavedArtists";
import ClientMessages from "@/components/dashboard/ClientMessages";
import ProjectRating from "@/components/dashboard/ProjectRating";
import ClientPayments from "@/components/dashboard/ClientPayments";
import UniversalChatbot from '@/components/UniversalChatbot';
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ClientDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { user } = useAuth();
  const { projects, loading } = useProjects();

  // Filter projects by status
  const activeProjects = projects.filter(p => p.status === 'pending' || p.status === 'accepted');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const WelcomeMessage = () => (
    <div className="text-center py-12">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 max-w-md mx-auto">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Welcome to Artswarit!</h3>
        <p className="text-gray-600 mb-4">
          Your dashboard will be updated once you post a requirement and start working with artists.
        </p>
        <Button asChild className="w-full">
          <Link to="/explore">Find Artists</Link>
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 pt-20 sm:pt-[84px]">
        {/* Dashboard Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}! Manage your projects and discover new artists.
          </p>
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
            {projects.length === 0 ? (
              <WelcomeMessage />
            ) : (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="font-medium text-xs sm:text-sm text-muted-foreground mb-2">Active Projects</h3>
                      <p className="text-2xl sm:text-3xl font-bold">{activeProjects.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="font-medium text-xs sm:text-sm text-muted-foreground mb-2">Completed Projects</h3>
                      <p className="text-2xl sm:text-3xl font-bold">{completedProjects.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="font-medium text-xs sm:text-sm text-muted-foreground mb-2">Total Projects</h3>
                      <p className="text-2xl sm:text-3xl font-bold">{projects.length}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Projects Section */}
                {activeProjects.length > 0 && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                      <h2 className="font-heading text-lg sm:text-xl font-semibold">Active Projects</h2>
                      <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                        <Link to="/explore">Find More Artists</Link>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {activeProjects.slice(0, 3).map(project => (
                        <Card key={project.id} className="bg-white/60 backdrop-blur-sm border-blue-100 hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm sm:text-base truncate">{project.title}</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Artist: {project.artist?.full_name || 'Not assigned'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Created: {new Date(project.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500 block">
                                  {project.deadline ? `Due: ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline'}
                                </span>
                                <div className="mt-1">
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                    project.status === "pending" 
                                      ? "bg-amber-100 text-amber-800" 
                                      : "bg-blue-100 text-blue-800"
                                  }`}>
                                    {project.status === "pending" ? "Waiting for Artist" : "In Progress"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <h2 className="font-heading text-lg sm:text-xl font-semibold">All Projects</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button className="w-full sm:w-auto" asChild>
                  <Link to="/explore">Post New Project</Link>
                </Button>
              </div>
            </div>
            
            {projects.length === 0 ? (
              <WelcomeMessage />
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {activeProjects.length > 0 && (
                  <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-amber-600" />
                        Active Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activeProjects.map(project => (
                          <Card key={project.id} className="border border-gray-100 bg-white/70">
                            <CardContent className="p-4">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{project.title}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  project.status === "pending" 
                                    ? "bg-amber-100 text-amber-800" 
                                    : "bg-blue-100 text-blue-800"
                                }`}>
                                  {project.status === "pending" ? "Waiting for Artist" : "In Progress"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Artist: {project.artist?.full_name || 'Not assigned'}
                              </p>
                              <div className="mt-3 flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                  Created: {new Date(project.created_at).toLocaleDateString()}
                                </span>
                                <Button size="sm" variant="outline">View Details</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {completedProjects.length > 0 && (
                  <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        Completed Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {completedProjects.map(project => (
                          <Card key={project.id} className="border border-gray-100 bg-white/70">
                            <CardContent className="p-4">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{project.title}</h4>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  Completed
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Artist: {project.artist?.full_name}
                              </p>
                              <div className="mt-3 flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                  Completed: {new Date(project.updated_at).toLocaleDateString()}
                                </span>
                                <Button size="sm" variant="outline">View Details</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
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
            <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings functionality coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <UniversalChatbot />
    </div>
  );
};

export default ClientDashboard;