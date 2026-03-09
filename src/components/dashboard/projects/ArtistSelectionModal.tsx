import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, UserPlus, Star } from "lucide-react";
import { toast } from "sonner";

interface Artist {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string | null;
  avgRating: number;
}

interface ArtistSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArtist: (artistId: string) => void;
}

export default function ArtistSelectionModal({
  isOpen,
  onClose,
  onSelectArtist,
}: ArtistSelectionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchSavedArtists();
    }
  }, [isOpen, user]);

  const fetchSavedArtists = async () => {
    setLoading(true);
    try {
      // 1. Get saved artists IDs
      const { data: saved, error: savedError } = await supabase
        .from("saved_artists")
        .select("artist_id")
        .eq("client_id", user?.id);

      if (savedError) throw savedError;

      // 2. Get followed artists IDs
      const { data: followed, error: followedError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user?.id);

      if (followedError) throw followedError;

      const savedIds = saved.map((s) => s.artist_id);
      const followedIds = followed.map((f) => f.following_id);
      
      // Combine and remove duplicates
      const artistIds = [...new Set([...savedIds, ...followedIds])];

      if (artistIds.length === 0) {
        setArtists([]);
        return;
      }

      // 3. Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url, role")
        .in("id", artistIds);

      if (profilesError) throw profilesError;

      // 4. Fetch ratings (simplified)
      const artistsWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const { data: reviews } = await supabase
            .from("project_reviews")
            .select("rating")
            .eq("artist_id", profile.id);

          const avgRating =
            reviews && reviews.length > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              : 0;

          return {
            id: profile.id,
            name: profile.full_name || "Unnamed Artist",
            avatarUrl: profile.avatar_url,
            role: profile.role,
            avgRating,
          };
        })
      );

      setArtists(artistsWithStats);
    } catch (error: any) {
      console.error("Error fetching artists:", error);
      toast.error("Failed to load saved artists");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Assign Artist</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Choose an artist from your saved and followed list to assign to this
            project.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="mt-4 max-h-[60vh] -mx-1 px-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-3" />
              <p className="text-base">Loading artists...</p>
            </div>
          ) : artists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-6 text-base">
                You haven't saved any artists yet.
              </p>
              <Button variant="outline" onClick={onClose} className="h-[48px] px-6">
                Browse Artists
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-3 sm:p-4 border rounded-xl hover:bg-accent transition-colors cursor-pointer group active:bg-accent/80 min-h-[48px]"
                  onClick={() => onSelectArtist(artist.id)}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar className="h-[48px] w-[48px] sm:h-10 sm:w-10">
                      <AvatarImage src={artist.avatarUrl || ""} />
                      <AvatarFallback>
                        {artist.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-bold sm:font-medium text-base sm:text-sm truncate">{artist.name}</h4>
                      <p className="text-xs sm:text-xs text-muted-foreground truncate">
                        {artist.role || "Artist"}
                      </p>
                      {artist.avgRating > 0 && (
                        <div className="flex items-center gap-1 mt-1 sm:mt-0.5">
                          <Star className="h-3.5 w-3.5 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold sm:font-medium">
                            {artist.avgRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-[48px] w-[48px] sm:h-9 sm:w-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <UserPlus className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
