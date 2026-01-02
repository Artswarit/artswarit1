import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Loader2 } from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().max(1000).optional(),
});

interface Project {
  id: string;
  title: string;
  status: string | null;
  artist_id: string | null;
  client_id: string | null;
  created_at: string;
  artistName?: string;
  artistAvatar?: string;
}

interface Review {
  id: string;
  project_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  project?: { title: string };
  artistName?: string;
  artistAvatar?: string;
}

const ProjectRating = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [reviewedProjectIds, setReviewedProjectIds] = useState<Set<string>>(new Set());

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);

    // Fetch completed projects for this client
    const { data: projects, error: projError } = await supabase
      .from("projects")
      .select("*")
      .eq("client_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (projError) {
      console.error("Error fetching projects:", projError);
    }

    // Fetch reviews by this client
    const { data: reviews, error: revError } = await supabase
      .from("project_reviews")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    if (revError) {
      console.error("Error fetching reviews:", revError);
    }

    const reviewedIds = new Set((reviews || []).map((r) => r.project_id));
    setReviewedProjectIds(reviewedIds);

    // Enrich projects with artist info
    const enrichedProjects: Project[] = [];
    for (const proj of projects || []) {
      if (proj.artist_id) {
        const { data: artist } = await supabase
          .from("public_profiles")
          .select("full_name, avatar_url")
          .eq("id", proj.artist_id)
          .maybeSingle();

        enrichedProjects.push({
          ...proj,
          artistName: artist?.full_name || "Unknown Artist",
          artistAvatar: artist?.avatar_url || undefined,
        });
      } else {
        enrichedProjects.push(proj);
      }
    }

    // Enrich reviews with project/artist info
    const enrichedReviews: Review[] = [];
    for (const rev of reviews || []) {
      const project = enrichedProjects.find((p) => p.id === rev.project_id);
      enrichedReviews.push({
        ...rev,
        project: project ? { title: project.title } : undefined,
        artistName: project?.artistName,
        artistAvatar: project?.artistAvatar,
      });
    }

    setCompletedProjects(enrichedProjects);
    setMyReviews(enrichedReviews);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Real-time subscription for reviews updates
  useEffect(() => {
    if (!user?.id) return;

    const reviewsChannel = supabase
      .channel(`client-reviews-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_reviews',
          filter: `client_id=eq.${user.id}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const projectsChannel = supabase
      .channel(`client-projects-reviews-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `client_id=eq.${user.id}`
        },
        (payload) => {
          // Refetch when a project status changes to completed
          if ((payload.new as any)?.status === 'completed') {
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reviewsChannel);
      supabase.removeChannel(projectsChannel);
    };
  }, [user?.id]);

  const handleSubmitRating = async () => {
    if (!selectedProject || !user?.id) return;

    const validation = reviewSchema.safeParse({ rating, reviewText: review.trim() || undefined });
    if (!validation.success) {
      toast({ variant: "destructive", title: "Please select a rating (1-5)" });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("project_reviews").insert({
      project_id: selectedProject.id,
      artist_id: selectedProject.artist_id,
      client_id: user.id,
      rating,
      review_text: review.trim() || null,
    });

    if (error) {
      toast({ variant: "destructive", title: "Failed to submit review", description: error.message });
    } else {
      toast({ title: "Review submitted!" });
      setDialogOpen(false);
      setSelectedProject(null);
      setRating(0);
      setHoverRating(0);
      setReview("");
      fetchData();
    }
    setSubmitting(false);
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${interactive ? "cursor-pointer" : ""} ${
          index < (interactive ? hoverRating || rating : currentRating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
        onClick={interactive ? () => setRating(index + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(index + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      />
    ));
  };

  const unratedProjects = completedProjects.filter((p) => !reviewedProjectIds.has(p.id));

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                      src={project.artistAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50"}
                      alt={project.artistName || "Artist"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <CardDescription>by {project.artistName || "Unknown"}</CardDescription>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-artswarit-purple to-blue-500"
                    onClick={() => {
                      setSelectedProject(project);
                      setDialogOpen(true);
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Rate & Review
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* My Reviews */}
      {myReviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Reviews</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myReviews.map((rev) => (
              <Card key={rev.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.artistAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50"}
                      alt={rev.artistName || "Artist"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base">{rev.project?.title || "Project"}</CardTitle>
                      <CardDescription>by {rev.artistName || "Unknown"}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">{renderStars(rev.rating)}</div>
                    <span className="text-sm text-muted-foreground">({rev.rating}/5)</span>
                  </div>

                  {rev.review_text && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{rev.review_text}</p>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Reviewed on {new Date(rev.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedProjects.length === 0 && myReviews.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
          <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No completed projects yet</h3>
          <p className="text-muted-foreground">Complete projects to rate and review artists</p>
        </div>
      )}

      {/* Rating Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              <div className="flex justify-center gap-1">{renderStars(rating, true)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {rating > 0 &&
                  (rating === 1
                    ? "Poor"
                    : rating === 2
                    ? "Fair"
                    : rating === 3
                    ? "Good"
                    : rating === 4
                    ? "Very Good"
                    : "Excellent")}
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
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">{review.length}/1000 characters</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={rating === 0 || submitting}
              className="bg-gradient-to-r from-artswarit-purple to-blue-500"
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectRating;
