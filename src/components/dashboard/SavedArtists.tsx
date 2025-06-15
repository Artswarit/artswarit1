
import { useState } from "react";
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
import { Star, Heart, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

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

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role, bio')
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
      // Mock data for display purposes
      avgRating: 4.7,
      completedProjects: (profile.full_name?.length || 5) * 3,
      hourlyRate: "₹2,500/hour",
      specialties: [profile.role === 'premium' ? 'Premium' : 'Creative', 'Verified'],
      lastActive: "Active recently",
    }));
  };

  const { data: savedArtists, isLoading } = useQuery({
    queryKey: ['savedArtists', user?.id],
    queryFn: fetchSavedArtists,
    enabled: !!user,
  });

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Saved Artists</h2>
          <p className="text-muted-foreground">Artists you've saved for future projects</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/explore">Browse More Artists</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      )}

      {!isLoading && savedArtists && savedArtists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedArtists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={artist.imageUrl || '/placeholder.svg'}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{artist.name}</CardTitle>
                    <CardDescription>{artist.category}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveArtist(artist.id)}
                    disabled={unsaveArtistMutation.isPending}
                  >
                    <Heart className="h-4 w-4 fill-current text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{artist.avgRating}</span>
                    <span className="text-muted-foreground">({artist.completedProjects} projects)</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{artist.lastActive}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {artist.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">{specialty}</Badge>
                  ))}
                </div>
                <div className="text-sm font-medium text-green-600">{artist.hourlyRate}</div>
                <div className="flex gap-2">
                  <Dialog open={!!selectedArtist && selectedArtist.id === artist.id} onOpenChange={(isOpen) => !isOpen && setSelectedArtist(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex-1" onClick={() => setSelectedArtist(artist)}>
                        <Send className="h-4 w-4 mr-1" />
                        Request Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Send Project Request</DialogTitle>
                        <DialogDescription>Send a project request to {selectedArtist?.name}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="title">Project Title</Label>
                          <Input id="title" value={projectRequest.title} onChange={(e) => setProjectRequest({...projectRequest, title: e.target.value})} placeholder="e.g., Album Cover Design" />
                        </div>
                        <div>
                          <Label htmlFor="budget">Budget (₹)</Label>
                          <Input id="budget" type="number" value={projectRequest.budget} onChange={(e) => setProjectRequest({...projectRequest, budget: e.target.value})} placeholder="e.g., 15000" />
                        </div>
                        <div>
                          <Label htmlFor="deadline">Deadline</Label>
                          <Input id="deadline" type="date" value={projectRequest.deadline} onChange={(e) => setProjectRequest({...projectRequest, deadline: e.target.value})} />
                        </div>
                        <div>
                          <Label htmlFor="description">Project Description</Label>
                          <Textarea id="description" value={projectRequest.description} onChange={(e) => setProjectRequest({...projectRequest, description: e.target.value})} placeholder="Describe your project requirements..." rows={3} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedArtist(null)}>Cancel</Button>
                        <Button onClick={handleSendProjectRequest} disabled={sendProjectRequestMutation.isPending}>
                          {sendProjectRequestMutation.isPending ? 'Sending...' : 'Send Request'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/artist/${artist.id}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No saved artists yet</h3>
            <p className="text-muted-foreground mb-4">Start exploring and save artists you'd like to work with</p>
            <Button asChild>
              <Link to="/explore">Explore Artists</Link>
            </Button>
          </div>
        )
      )}
    </div>
  );
};

export default SavedArtists;
