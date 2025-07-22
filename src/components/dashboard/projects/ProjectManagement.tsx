
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, User, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  budget: number;
  deadline: string;
  client_name: string;
  created_at: string;
}

const ProjectManagement = () => {
  const [projects] = useState<Project[]>([
    {
      id: '1',
      title: 'Digital Portrait Commission',
      description: 'Create a realistic digital portrait for social media profile',
      status: 'active',
      budget: 250,
      deadline: '2024-02-15',
      client_name: 'John Smith',
      created_at: '2024-01-15'
    },
    {
      id: '2',
      title: 'Logo Design for Startup',
      description: 'Modern minimalist logo for tech startup company',
      status: 'pending',
      budget: 500,
      deadline: '2024-02-20',
      client_name: 'Tech Innovations Inc',
      created_at: '2024-01-18'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const pendingProjects = projects.filter(p => p.status === 'pending');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {project.description}
            </p>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{project.client_name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${project.budget}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Due: {formatDate(project.deadline)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Created: {formatDate(project.created_at)}</span>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          {project.status === 'pending' && (
            <Button size="sm">
              Accept Project
            </Button>
          )}
          {project.status === 'active' && (
            <Button size="sm">
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingProjects.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {activeProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {activeProjects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No active projects
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {pendingProjects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pending projects
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {completedProjects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No completed projects
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;
