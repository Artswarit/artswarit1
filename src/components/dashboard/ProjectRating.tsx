
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";

interface CompletedProject {
  id: string;
  title: string;
  artistName: string;
  artistAvatar: string;
  completedDate: string;
  deliverables: string[];
  rating?: number;
  review?: string;
  hasRated: boolean;
}

const ProjectRating = () => {
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([
    {
      id: "p1",
      title: "Logo Design",
      artistName: "Taylor Reed",
      artistAvatar: "https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
      completedDate: "2025-05-10",
      deliverables: ["Final Logo Files", "Brand Guidelines", "Color Variations"],
      rating: 5,
      review: "Excellent work! Taylor delivered exactly what I was looking for and more. Great communication throughout the project.",
      hasRated: true
    },
    {
      id: "p2",
      title: "Podcast Intro Music",
      artistName: "Alex Rivera",
      artistAvatar: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      completedDate: "2025-05-15",
      deliverables: ["30-second Intro", "15-second Version", "Instrumental Version"],
      hasRated: false
    },
    {
      id: "p3",
      title: "Website Content Writing",
      artistName: "Maya Johnson",
      artistAvatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      completedDate: "2025-05-20",
      deliverables: ["Home Page Copy", "About Page", "Service Descriptions"],
      hasRated: false
    }
  ]);

  const [selectedProject, setSelectedProject] = useState<CompletedProject | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmitRating = () => {
    if (!selectedProject || rating === 0) return;

    setCompletedProjects(prev => 
      prev.map(project => 
        project.id === selectedProject.id 
          ? { ...project, rating, review, hasRated: true }
          : project
      )
    );

    console.log("Rating submitted:", { projectId: selectedProject.id, rating, review });
    setSelectedProject(null);
    setRating(0);
    setHoverRating(0);
    setReview("");
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          interactive ? 'cursor-pointer' : ''
        } ${
          index < (interactive ? (hoverRating || rating) : currentRating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
        onClick={interactive ? () => setRating(index + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(index + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      />
    ));
  };

  const unratedProjects = completedProjects.filter(p => !p.hasRated);
  const ratedProjects = completedProjects.filter(p => p.hasRated);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Project Reviews</h2>
        <p className="text-muted-foreground">Rate and review completed projects</p>
      </div>

      {/* Projects Pending Rating */}
      {unratedProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Pending Reviews</h3>
            <Badge className="bg-orange-100 text-orange-800">{unratedProjects.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unratedProjects.map((project) => (
              <Card key={project.id} className="border border-orange-200 bg-orange-50/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={project.artistAvatar}
                      alt={project.artistName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <CardDescription>by {project.artistName}</CardDescription>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Completed on {new Date(project.completedDate).toLocaleDateString()}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Deliverables:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {project.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-to-r from-artswarit-purple to-blue-500"
                        onClick={() => setSelectedProject(project)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Rate & Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rate Your Experience</DialogTitle>
                        <DialogDescription>
                          How was your experience working with {selectedProject?.artistName} on "{selectedProject?.title}"?
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm font-medium mb-2">Overall Rating</p>
                          <div className="flex justify-center gap-1">
                            {renderStars(rating, true)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rating > 0 && (
                              rating === 1 ? "Poor" :
                              rating === 2 ? "Fair" :
                              rating === 3 ? "Good" :
                              rating === 4 ? "Very Good" : "Excellent"
                            )}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Write a Review (Optional)</label>
                          <Textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience working with this artist..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedProject(null)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmitRating}
                          disabled={rating === 0}
                          className="bg-gradient-to-r from-artswarit-purple to-blue-500"
                        >
                          Submit Rating
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Ratings */}
      {ratedProjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Reviews</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratedProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={project.artistAvatar}
                      alt={project.artistName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <CardDescription>by {project.artistName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {renderStars(project.rating || 0)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({project.rating}/5)
                    </span>
                  </div>
                  
                  {project.review && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{project.review}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Reviewed on {new Date(project.completedDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedProjects.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
          <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No completed projects yet</h3>
          <p className="text-muted-foreground">Complete projects to rate and review artists</p>
        </div>
      )}
    </div>
  );
};

export default ProjectRating;
