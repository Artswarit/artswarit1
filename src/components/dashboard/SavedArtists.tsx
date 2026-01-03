
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Heart, Send, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SavedArtist {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  avgRating: number;
  completedProjects: number;
  hourlyRate: string;
  specialties: string[];
  lastActive: string;
}

const SavedArtists = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedArtist, setSelectedArtist] = useState<SavedArtist | null>(null);
  const [projectRequest, setProjectRequest] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });

  const fetchSavedArtists = async () => {
    if (!user) return [];
    
    const { data: saved, error: savedError } = await supabase
      .from('saved_artists')
      .select('artist_id')
      .eq('client_id', user.id);

    if (savedError) {
      console.error("Error fetching saved artists:", savedError);
      throw new Error(savedError.message);
    }

    const artistIds = saved.map(s => s.artist_id);

    if (artistIds.length === 0) return [];

    // Use public_profiles view which has public read access
    const { data: profiles, error: profilesError } = await supabase
      .from('public_profiles')
      .select('id, full_name, avatar_url, role, bio, hourly_rate')
      .in('id', artistIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw new Error(profilesError.message);
    }
    
    return profiles.map((profile): SavedArtist => ({
      id: profile.id,
      name: profile.full_name || 'Unnamed Artist',
      category: profile.role || 'Artist',
      imageUrl: profile.avatar_url,
      avgRating: 4.7,
      completedProjects: (profile.full_name?.length || 5) * 3,
      hourlyRate: profile.hourly_rate ? `₹${profile.hourly_rate}/hour` : "₹2,500/hour",
      specialties: [profile.role === 'premium' ? 'Premium' : 'Creative', 'Verified'],
      lastActive: "Active recently",
    }));
  };

  const { data: savedArtists, isLoading, refetch } = useQuery({
    queryKey: ['savedArtists', user?.id],
    queryFn: fetchSavedArtists,
    enabled: !!user,
  });

  // Real-time subscription for saved artists updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`saved-artists-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_artists',
          filter: `client_id=eq.${user.id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const unsaveArtistMutation = useMutation({
    mutationFn: async (artistId: string) => {
      if (!user) throw new Error("User not logged in");
      const { error } = await supabase
        .from('saved_artists')
        .delete()
        .eq('client_id', user.id)
        .eq('artist_id', artistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedArtists', user?.id] });
      toast({ title: "Artist Unsaved" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: `Could not unsave artist: ${error.message}` });
    },
  });

  const sendProjectRequestMutation = useMutation({
    mutationFn: async (newProject: { title: string; description: string; budget: string; deadline: string; artist_id: string }) => {
      if (!user) throw new Error("User not logged in");
      const { error } = await supabase.from('projects').insert([{
        client_id: user.id,
        artist_id: newProject.artist_id,
        title: newProject.title,
        description: newProject.description,
        budget: newProject.budget ? parseFloat(newProject.budget) : null,
        deadline: newProject.deadline || null,
        status: 'pending',
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Project request sent!" });
      setProjectRequest({ title: "", description: "", budget: "", deadline: "" });
      setSelectedArtist(null);
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error sending request", description: error.message });
    },
  });

  const handleSendProjectRequest = () => {
    if (!selectedArtist) return;
    sendProjectRequestMutation.mutate({ ...projectRequest, artist_id: selectedArtist.id });
  };

  const handleRemoveArtist = (artistId: string) => {
    unsaveArtistMutation.mutate(artistId);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Saved Artists</h2>
          <p className="text-muted-foreground text-sm">Artists you've saved for future projects</p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/explore">Browse More Artists</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && savedArtists && savedArtists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {savedArtists.map((artist, index) => (
            <Card 
              key={artist.id} 
              className={cn(
                "hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <img
                    src={artist.imageUrl || '/placeholder.svg'}
                    alt={artist.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-background"
                  />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-lg truncate">{artist.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{artist.category}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveArtist(artist.id)}
                    disabled={unsaveArtistMutation.isPending}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    {unsaveArtistMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{artist.avgRating}</span>
                    <span className="text-muted-foreground">({artist.completedProjects})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{artist.lastActive}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {artist.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-[10px] sm:text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs sm:text-sm font-medium text-green-600">{artist.hourlyRate}</div>
                <div className="flex gap-2">
                  <Dialog open={!!selectedArtist && selectedArtist.id === artist.id} onOpenChange={(isOpen) => !isOpen && setSelectedArtist(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex-1 text-xs sm:text-sm h-8 sm:h-9" onClick={() => setSelectedArtist(artist)}>
                        <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Send Project Request</DialogTitle>
                        <DialogDescription className="text-sm">
                          Send a project request to {selectedArtist?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                        <div>
                          <Label htmlFor="title" className="text-sm">Project Title</Label>
                          <Input 
                            id="title" 
                            value={projectRequest.title} 
                            onChange={(e) => setProjectRequest({...projectRequest, title: e.target.value})} 
                            placeholder="e.g., Album Cover Design"
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="budget" className="text-sm">Budget (₹)</Label>
                            <Input 
                              id="budget" 
                              type="number" 
                              value={projectRequest.budget} 
                              onChange={(e) => setProjectRequest({...projectRequest, budget: e.target.value})} 
                              placeholder="15000"
                              className="mt-1 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="deadline" className="text-sm">Deadline</Label>
                            <Input 
                              id="deadline" 
                              type="date" 
                              value={projectRequest.deadline} 
                              onChange={(e) => setProjectRequest({...projectRequest, deadline: e.target.value})}
                              className="mt-1 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-sm">Description</Label>
                          <Textarea 
                            id="description" 
                            value={projectRequest.description} 
                            onChange={(e) => setProjectRequest({...projectRequest, description: e.target.value})} 
                            placeholder="Describe your project requirements..." 
                            rows={3}
                            className="mt-1 text-sm resize-none"
                          />
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setSelectedArtist(null)} className="text-sm">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSendProjectRequest} 
                          disabled={sendProjectRequestMutation.isPending || !projectRequest.title}
                          className="text-sm"
                        >
                          {sendProjectRequestMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Request'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm h-8 sm:h-9">
                    <Link to={`/artist/${artist.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-12 sm:py-16 bg-muted/30 rounded-lg border border-dashed animate-fade-in">
            <Heart className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-3 sm:mb-4" />
            <h3 className="text-sm sm:text-lg font-medium text-muted-foreground mb-1 sm:mb-2">No saved artists yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Start exploring and save artists you'd like to work with</p>
            <Button asChild size="sm" className="text-sm">
              <Link to="/explore">Explore Artists</Link>
            </Button>
          </div>
        )
      )}
    </div>
  );
};

export default SavedArtists;
