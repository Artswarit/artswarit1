
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusCircle, Calendar, MessageCircle, FileUp, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

interface Project {
  id: string;
  title: string;
  client: string;
  clientAvatar: string;
  status: "active" | "completed" | "pending";
  progress: number;
  deadline: string;
  payment: string;
  description: string;
  milestones: Milestone[];
  files: ProjectFile[];
  lastMessage?: {
    text: string;
    date: string;
  };
}

const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Album Cover Design",
      client: "Maya Johnson",
      clientAvatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      status: "active",
      progress: 65,
      deadline: "2025-06-01",
      payment: "₹15,000",
      description: "Design an album cover for indie artist Maya Johnson. The album is titled 'Echoes of Silence' and requires a minimalist design with abstract elements.",
      milestones: [
        { id: "m1", title: "Initial concept sketches", completed: true, dueDate: "2025-05-15" },
        { id: "m2", title: "Draft design approval", completed: true, dueDate: "2025-05-25" },
        { id: "m3", title: "Color palette finalization", completed: false, dueDate: "2025-05-30" },
        { id: "m4", title: "Final design delivery", completed: false, dueDate: "2025-06-01" }
      ],
      files: [
        { id: "f1", name: "concept_sketch_v1.jpg", type: "image/jpeg", uploadDate: "2025-05-15", size: "2.3 MB" },
        { id: "f2", name: "draft_design_v2.psd", type: "application/octet-stream", uploadDate: "2025-05-25", size: "8.7 MB" }
      ],
      lastMessage: {
        text: "I love the draft design! Can we try a darker color palette?",
        date: "2025-05-26"
      }
    },
    {
      id: "2",
      title: "Portrait Commission",
      client: "Jordan Smith",
      clientAvatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      status: "pending",
      progress: 0,
      deadline: "2025-06-15",
      payment: "₹8,500",
      description: "Create a digital portrait of the client in a contemporary style. The portrait should capture the client's likeness while incorporating artistic elements.",
      milestones: [
        { id: "m1", title: "Reference photos approval", completed: false, dueDate: "2025-06-01" },
        { id: "m2", title: "Preliminary sketch", completed: false, dueDate: "2025-06-05" },
        { id: "m3", title: "Final portrait delivery", completed: false, dueDate: "2025-06-15" }
      ],
      files: []
    },
    {
      id: "3",
      title: "Logo Design for Tech Startup",
      client: "Taylor Reed",
      clientAvatar: "https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
      status: "completed",
      progress: 100,
      deadline: "2025-05-10",
      payment: "₹12,000",
      description: "Design a modern, minimal logo for a new tech startup called 'NeuralFlow'. The logo should represent innovation and artificial intelligence.",
      milestones: [
        { id: "m1", title: "Logo concepts presentation", completed: true, dueDate: "2025-04-25" },
        { id: "m2", title: "Revisions based on feedback", completed: true, dueDate: "2025-05-01" },
        { id: "m3", title: "Final logo package delivery", completed: true, dueDate: "2025-05-10" }
      ],
      files: [
        { id: "f1", name: "logo_concepts.pdf", type: "application/pdf", uploadDate: "2025-04-25", size: "4.1 MB" },
        { id: "f2", name: "neuralflow_logo_final.ai", type: "application/illustrator", uploadDate: "2025-05-10", size: "6.2 MB" },
        { id: "f3", name: "neuralflow_brand_guidelines.pdf", type: "application/pdf", uploadDate: "2025-05-10", size: "8.4 MB" }
      ]
    }
  ]);

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: "", dueDate: "" });

  const handleMilestoneToggle = (projectId: string, milestoneId: string) => {
    setProjects(projects.map(project => 
      project.id === projectId ? {
        ...project,
        milestones: project.milestones.map(milestone => 
          milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone
        ),
        progress: calculateProgress(project.milestones.map(milestone => 
          milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone
        ))
      } : project
    ));
  };

  const calculateProgress = (milestones: Milestone[]): number => {
    if (milestones.length === 0) return 0;
    const completedCount = milestones.filter(m => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  const handleFileUpload = (projectId: string) => {
    setFileUploading(true);
    // Simulate file upload
    setTimeout(() => {
      const newFile = {
        id: `f${Math.floor(Math.random() * 1000)}`,
        name: "new_upload.jpg",
        type: "image/jpeg",
        uploadDate: new Date().toISOString().split('T')[0],
        size: "3.2 MB"
      };

      setProjects(projects.map(project => 
        project.id === projectId ? {
          ...project,
          files: [...project.files, newFile]
        } : project
      ));
      
      setFileUploading(false);
    }, 2000);
  };

  const handleAddMilestone = (projectId: string) => {
    if (!newMilestone.title || !newMilestone.dueDate) return;

    const newMilestoneObj = {
      id: `m${Math.floor(Math.random() * 1000)}`,
      title: newMilestone.title,
      completed: false,
      dueDate: newMilestone.dueDate
    };

    setProjects(projects.map(project => 
      project.id === projectId ? {
        ...project,
        milestones: [...project.milestones, newMilestoneObj],
        progress: calculateProgress([...project.milestones, newMilestoneObj])
      } : project
    ));

    setNewMilestone({ title: "", dueDate: "" });
  };

  const activeProjects = projects.filter(p => p.status === "active");
  const pendingProjects = projects.filter(p => p.status === "pending");
  const completedProjects = projects.filter(p => p.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Project Management</h2>
          <p className="text-muted-foreground">Manage client projects and track their progress</p>
        </div>
        <Button className="bg-gradient-to-r from-artswarit-purple to-blue-500 border-none">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="active" className="flex gap-2 items-center">
            <Clock size={16} />
            <span>Active ({activeProjects.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex gap-2 items-center">
            <Loader2 size={16} />
            <span>Pending ({pendingProjects.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex gap-2 items-center">
            <CheckCircle size={16} />
            <span>Completed ({completedProjects.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeProjects.map(project => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <img 
                            src={project.clientAvatar} 
                            alt={project.client} 
                            className="w-5 h-5 rounded-full mr-2"
                          />
                          {project.client}
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1.5 text-primary" />
                        <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{project.payment}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setActiveProject(project)}
                    >
                      <span>View Details</span>
                    </Button>

                    {project.lastMessage && (
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-muted-foreground"
                      >
                        <MessageCircle size={16} />
                        <span>New Message</span>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
              <h3 className="text-lg font-medium text-gray-600">No active projects</h3>
              <p className="text-muted-foreground mt-1">You don't have any active projects at the moment.</p>
              <Button className="mt-4 bg-gradient-to-r from-artswarit-purple to-blue-500 border-none">
                <PlusCircle className="mr-2 h-4 w-4" />
                Start New Project
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingProjects.map(project => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <img 
                            src={project.clientAvatar} 
                            alt={project.client} 
                            className="w-5 h-5 rounded-full mr-2"
                          />
                          {project.client}
                        </CardDescription>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{project.description.substring(0, 100)}...</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1.5 text-primary" />
                        <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{project.payment}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setActiveProject(project)}
                    >
                      <span>View Details</span>
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-artswarit-purple to-blue-500 border-none"
                      size="sm"
                    >
                      Accept Project
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
              <h3 className="text-lg font-medium text-gray-600">No pending projects</h3>
              <p className="text-muted-foreground mt-1">You don't have any pending project requests at the moment.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedProjects.map(project => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <img 
                            src={project.clientAvatar} 
                            alt={project.client} 
                            className="w-5 h-5 rounded-full mr-2"
                          />
                          {project.client}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <CheckCircle size={16} className="mr-1.5 text-green-600" />
                        <span>Completed on {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{project.payment}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setActiveProject(project)}
                    >
                      <span>View Details</span>
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <span>Download Files</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
              <h3 className="text-lg font-medium text-gray-600">No completed projects</h3>
              <p className="text-muted-foreground mt-1">You haven't completed any projects yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Project Details Dialog */}
      {activeProject && (
        <Dialog open={!!activeProject} onOpenChange={() => setActiveProject(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{activeProject.title}</span>
                {activeProject.status === "active" && (
                  <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                )}
                {activeProject.status === "pending" && (
                  <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                )}
                {activeProject.status === "completed" && (
                  <Badge className="bg-green-100 text-green-700">Completed</Badge>
                )}
              </DialogTitle>
              <DialogDescription className="flex items-center mt-1">
                <img 
                  src={activeProject.clientAvatar} 
                  alt={activeProject.client} 
                  className="w-5 h-5 rounded-full mr-2"
                />
                Project for {activeProject.client}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Calendar size={24} className="mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-medium">{new Date(activeProject.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <svg className="h-6 w-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <p className="font-medium">{activeProject.payment}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="mr-3 p-1 bg-blue-100 rounded-full">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="font-medium">{activeProject.progress}% Complete</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium">Project Description</h4>
              <p className="text-muted-foreground text-sm">{activeProject.description}</p>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Milestones</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={() => handleAddMilestone(activeProject.id)}
                >
                  <PlusCircle className="mr-1 h-3 w-3" />
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-2">
                {activeProject.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={milestone.completed}
                      onCheckedChange={() => handleMilestoneToggle(activeProject.id, milestone.id)}
                      disabled={activeProject.status === "completed"}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <Label 
                        htmlFor={milestone.id} 
                        className={`text-sm ${milestone.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {milestone.title}
                      </Label>
                      <span className="text-xs text-muted-foreground">{milestone.dueDate}</span>
                    </div>
                  </div>
                ))}

                {/* New milestone form */}
                <div className="flex items-center gap-2 mt-4">
                  <Input 
                    placeholder="New milestone"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    className="h-8 text-sm"
                  />
                  <Input 
                    type="date"
                    value={newMilestone.dueDate}
                    onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                    className="h-8 text-sm"
                  />
                  <Button 
                    size="sm"
                    className="h-8 px-2" 
                    onClick={() => handleAddMilestone(activeProject.id)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Project Files</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleFileUpload(activeProject.id)}
                  disabled={fileUploading}
                >
                  {fileUploading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-1 h-3 w-3" />
                      <span>Upload File</span>
                    </>
                  )}
                </Button>
              </div>

              {activeProject.files.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 border-b">
                    <div className="grid grid-cols-5">
                      <div className="col-span-2">Name</div>
                      <div>Type</div>
                      <div>Size</div>
                      <div>Upload Date</div>
                    </div>
                  </div>
                  <div className="divide-y">
                    {activeProject.files.map(file => (
                      <div key={file.id} className="px-4 py-3 text-sm">
                        <div className="grid grid-cols-5 items-center">
                          <div className="col-span-2 font-medium hover:text-primary cursor-pointer">{file.name}</div>
                          <div className="text-muted-foreground">{file.type.split('/')[1]}</div>
                          <div className="text-muted-foreground">{file.size}</div>
                          <div className="text-muted-foreground">{file.uploadDate}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                  <FileUp className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">No files uploaded yet</p>
                  <Button 
                    variant="link" 
                    size="sm"
                    className="mt-2"
                    onClick={() => handleFileUpload(activeProject.id)}
                    disabled={fileUploading}
                  >
                    {fileUploading ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between items-center gap-2 sm:gap-0">
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <MessageCircle size={16} />
                <span>Message Client</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveProject(null)}
                >
                  Close
                </Button>
                {activeProject.status === "active" && (
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-artswarit-purple to-blue-500 border-none"
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    <span>Complete Project</span>
                  </Button>
                )}
                {activeProject.status === "pending" && (
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-artswarit-purple to-blue-500 border-none"
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    <span>Accept Project</span>
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectManagement;
