
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Heart, Send, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";

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
  const { format } = useCurrencyFormat();
  const queryClient = useQueryClient();

  const [selectedArtist, setSelectedArtist] = useState<SavedArtist | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const ITEMS_PER_PAGE = 6;

  const fetchSavedArtists = async () => {
    if (!user) return [];
    
    const { data: saved, error: savedError } = await supabase
      .from('saved_artists')
      .select('artist_id')
      .eq('client_id', user.id);

    if (savedError) {
      throw new Error(savedError.message);
    }

    const artistIds = saved.map(s => s.artist_id);

    if (artistIds.length === 0) return [];

    // Use public_profiles view which has public read access
    const { data: profiles, error: profilesError } = await supabase
      .from('public_profiles')
      .select('id, full_name, avatar_url, role, bio, hourly_rate, is_verified, tags, created_at')
      .in('id', artistIds);

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    // Fetch real stats for each artist
    const artistStats = await Promise.all(
      artistIds.map(async (artistId) => {
        // Get completed projects count
        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', artistId)
          .eq('status', 'completed');

        // Get average rating from project_reviews
        const { data: reviews } = await supabase
          .from('project_reviews')
          .select('rating')
          .eq('artist_id', artistId);

        const avgRating = reviews && reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : null;

        return {
          artistId,
          completedProjects: projectCount || 0,
          avgRating,
          reviewCount: reviews?.length || 0
        };
      })
    );

    const statsMap = new Map(artistStats.map(s => [s.artistId, s]));
    
    return profiles.map((profile): SavedArtist => {
      const stats = statsMap.get(profile.id);
      const tags = profile.tags as string[] | null;
      
      return {
        id: profile.id!,
        name: profile.full_name || 'Unnamed Artist',
        category: profile.role || 'Artist',
        imageUrl: profile.avatar_url,
        avgRating: stats?.avgRating || 0,
        completedProjects: stats?.reviewCount || 0,
        hourlyRate: profile.hourly_rate ? `${format(Number(profile.hourly_rate))}/hour` : "Not set",
        specialties: [
          ...(tags?.slice(0, 2) || []),
          ...(profile.is_verified ? ['Verified'] : [])
        ].filter(Boolean),
        lastActive: profile.created_at ? `Joined ${new Date(profile.created_at).toLocaleDateString()}` : "Active recently",
      };
    });
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

  const handleRemoveArtist = (artistId: string) => {
    unsaveArtistMutation.mutate(artistId);
  };

  const handleOpenRequestDialog = (artist: SavedArtist) => {
    setSelectedArtist(artist);
    setIsRequestDialogOpen(true);
  };

  const handleCloseRequestDialog = () => {
    setIsRequestDialogOpen(false);
    setSelectedArtist(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Saved Artists</h2>
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {savedArtists.slice(0, visibleCount).map((artist, index) => (
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
                    className="h-10 w-10 sm:h-9 sm:w-9 p-0 shrink-0"
                  >
                    {unsaveArtistMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="h-5 w-5 sm:h-4 sm:w-4 fill-current text-red-500" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{artist.avgRating.toFixed(1)}</span>
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
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs sm:text-sm h-11 sm:h-9 font-bold" 
                    onClick={() => handleOpenRequestDialog(artist)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Request
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial text-xs sm:text-sm h-11 sm:h-9 font-bold">
                    <Link to={`/artist/${artist.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>

          {/* Load More */}
          {visibleCount < savedArtists.length && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                className="h-12 px-10 rounded-2xl font-black text-xs uppercase tracking-widest border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
                onClick={() => setVisibleCount(c => c + ITEMS_PER_PAGE)}
              >
                Load More · {Math.min(ITEMS_PER_PAGE, savedArtists.length - visibleCount)} of {savedArtists.length - visibleCount} remaining
              </Button>
            </div>
          )}
        </>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[3rem] border-2 border-dashed border-border/40 bg-muted/20 backdrop-blur-sm">
            <div className="rounded-[2rem] bg-muted/50 p-6 mb-6 shadow-inner">
              <Heart className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">No saved artists yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground text-center max-w-sm mb-8 font-medium leading-relaxed opacity-70">
              Build your roster of artists. Save artists you discover and revisit them when you're ready to collaborate.
            </p>
            <Button asChild className="gap-3 h-12 px-8 rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5">
              <Link to="/explore-artists">Discover Artists</Link>
            </Button>
          </div>
        )
      )}

      {/* Project Request Dialog - Uses same CreateProjectForm as Artist Profile */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-3xl p-4 sm:p-6">
          <DialogHeader className="mb-4 sm:mb-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold">Create Project Request</DialogTitle>
            <DialogDescription className="text-sm">
              Send a detailed project request to {selectedArtist?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedArtist && (
            <CreateProjectForm 
              artistId={selectedArtist.id}
              onSuccess={() => {
                handleCloseRequestDialog();
                toast({ title: "Project request sent successfully!" });
              }}
              onCancel={handleCloseRequestDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedArtists;
