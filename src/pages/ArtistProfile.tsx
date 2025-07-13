import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import ArtistHeader from "@/components/artist-profile/ArtistHeader";
import ArtistTabs from "@/components/artist-profile/ArtistTabs";
import TagDisplay from "@/components/artist-profile/TagDisplay";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Demo data for fallback
const ARTIST_UUID_1 = "11111111-1111-1111-1111-111111111111";
const ARTIST_UUID_2 = "22222222-2222-2222-2222-222222222222";

const artistsData = {
  [ARTIST_UUID_1]: {
    id: ARTIST_UUID_1,
    name: "Alex Rivera",
    category: "Musician",
    avatar: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.0&auto=format&fit=crop&w=200&q=80",
    bio: "Multi-platinum musician passionate about creating moving music and telling stories.",
    followers: 12035,
    likes: 3204,
    isVerified: true,
    specialties: ["Pop", "Rock", "Electronic"],
    location: "Los Angeles, CA",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    artworks: [
      { id: "a1", title: "Midnight Symphony", img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80" },
      { id: "a2", title: "Live Concert 2024", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80" }
    ],
  },
  [ARTIST_UUID_2]: {
    id: ARTIST_UUID_2,
    name: "Maya Johnson",
    category: "Writer",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80",
    bio: "Award-winning author, creative in fantasy and science fiction novels.",
    followers: 8621,
    likes: 1945,
    isVerified: true,
    specialties: ["Fantasy", "Sci-Fi", "Short Stories"],
    location: "New York, NY",
    cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    artworks: [
      { id: "b1", title: "Crystal Realm", img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80" }
    ],
  },
};

function toDemoUUID(id: string | undefined): string | undefined {
  if (id === "1") return ARTIST_UUID_1;
  if (id === "2") return ARTIST_UUID_2;
  return id;
}

export default function ArtistProfile() {
  const { id: routeId } = useParams();
  const id = toDemoUUID(routeId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  console.log("[ARTIST PROFILE] RouteID:", routeId, "Mapped ID:", id, "User:", user);

  const [profileState, setProfileState] = useState(() => {
    const demoArtist = artistsData[id as keyof typeof artistsData];
    return demoArtist;
  });

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(profileState?.followers || 0);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [projectRequest, setProjectRequest] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });
  const [showDiagnosticBanner, setShowDiagnosticBanner] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);

  useEffect(() => {
    setShowDiagnosticBanner(!user);
  }, [user]);

  // Fetch followers data
  useEffect(() => {
    async function fetchFollowersData() {
      if (!id || id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
        console.log("[ARTIST PROFILE] Demo profile - skipping DB fetch");
        return;
      }

      try {
        const { data: followers, error: countErr } = await supabase
          .from("follows")
          .select("id", { count: "exact", head: false })
          .eq("artist_id", id);

        if (!countErr && followers) {
          setFollowersCount(followers.length);
        }

        if (user?.id) {
          const { data: following, error: followErr } = await supabase
            .from("follows")
            .select("id")
            .eq("artist_id", id)
            .eq("client_id", user.id)
            .maybeSingle();
          setIsFollowing(!!following);
        }
      } catch (error) {
        console.error('Error fetching followers data:', error);
      }
    }
    fetchFollowersData();
  }, [id, user?.id]);

  // Fetch saved status
  useEffect(() => {
    async function checkSavedStatus() {
      if (!id || !user?.id || id === ARTIST_UUID_1 || id === ARTIST_UUID_2) return;

      try {
        const { data, error } = await supabase
          .from('saved_artists')
          .select('id')
          .eq('artist_id', id)
          .eq('client_id', user.id)
          .maybeSingle();
        
        if (!error) {
          setIsSaved(!!data);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    }

    if (user?.id) {
      checkSavedStatus();
    }
  }, [id, user?.id]);

  const handleFollow = async () => {
    if (!id || !user?.id) {
      toast({
        title: "Not logged in",
        description: "Please sign in to follow artists.",
      });
      return;
    }

    // Demo profiles
    if (id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
      setLoadingFollow(true);
      setTimeout(() => {
        if (!isFollowing) {
          setIsFollowing(true);
          setFollowersCount((cnt) => cnt + 1);
          toast({ title: "Followed (Demo)", description: "Demo artist profile" });
        } else {
          setIsFollowing(false);
          setFollowersCount((cnt) => Math.max(cnt - 1, 0));
          toast({ title: "Unfollowed (Demo)", description: "Demo artist profile" });
        }
        setLoadingFollow(false);
      }, 500);
      return;
    }

    setLoadingFollow(true);
    try {
      if (!isFollowing) {
        const { error } = await supabase.from("follows").insert({
          artist_id: id,
          client_id: user.id,
        });
        if (!error) {
          setIsFollowing(true);
          setFollowersCount((cnt) => cnt + 1);
          toast({ title: "Followed", description: "You are now following this artist!" });
        } else {
          toast({ variant: "destructive", title: "Error", description: "Something went wrong while following." });
        }
      } else {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("artist_id", id)
          .eq("client_id", user.id);
        if (!error) {
          setIsFollowing(false);
          setFollowersCount((cnt) => Math.max(cnt - 1, 0));
          toast({ title: "Unfollowed", description: "You have unfollowed this artist." });
        } else {
          toast({ variant: "destructive", title: "Error", description: "Could not unfollow artist." });
        }
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
    }
    setLoadingFollow(false);
  };

  const handleMessage = () => {
    if (!user?.id) {
      toast({ title: "Not logged in", description: "Please sign in to message artists." });
      return;
    }
    if (id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
      toast({ title: "Demo Message", description: `Demo profile - messaging ${profileState?.name}.` });
    } else {
      toast({ title: "Coming soon!", description: "Messaging will be available in a future update." });
    }
  };

  const handleToggleSave = async () => {
    if (!id || !user?.id) {
      toast({ title: "Not logged in", description: "Please sign in to save artists." });
      return;
    }

    if (id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
      setLoadingSave(true);
      setTimeout(() => {
        setIsSaved(!isSaved);
        toast({ title: isSaved ? "Artist Unsaved (Demo)" : "Artist Saved! (Demo)" });
        setLoadingSave(false);
      }, 500);
      return;
    }

    setLoadingSave(true);
    try {
      if (isSaved) {
        const { error } = await supabase
          .from("saved_artists")
          .delete()
          .eq("artist_id", id)
          .eq("client_id", user.id);
        
        if (!error) {
          setIsSaved(false);
          toast({ title: "Artist Unsaved" });
        } else {
          toast({ variant: "destructive", title: "Error", description: "Could not unsave artist." });
        }
      } else {
        const { error } = await supabase
          .from("saved_artists")
          .insert({ artist_id: id, client_id: user.id });

        if (!error) {
          setIsSaved(true);
          toast({ title: "Artist Saved!" });
        } else {
          toast({ variant: "destructive", title: "Error", description: "Could not save artist." });
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
    }
    setLoadingSave(false);
  };

  const sendProjectRequestMutation = useMutation({
    mutationFn: async (newProject: { title: string; description: string; budget: string; deadline: string; artist_id: string }) => {
        if (!user) throw new Error("User not logged in");
        if (!newProject.artist_id) throw new Error("Artist not found");
        
        const { error } = await supabase.from('projects').insert([{
            client_id: user.id,
            artist_id: newProject.artist_id,
            title: newProject.title,
            description: newProject.description,
            budget: newProject.budget ? parseFloat(newProject.budget) : null,
            deadline: newProject.deadline || null,
            status: 'pending'
        }]);

        if (error) throw error;
    },
    onSuccess: () => {
        toast({ title: "Project request sent!" });
        setProjectRequest({ title: "", description: "", budget: "", deadline: "" });
        setIsRequestDialogOpen(false);
    },
    onError: (error) => {
        toast({ variant: "destructive", title: "Error sending request", description: error.message });
    }
  });

  const handleSendProjectRequest = () => {
    if (!id) return;
    sendProjectRequestMutation.mutate({ ...projectRequest, artist_id: id });
  };

  const handleRequestProject = () => {
    if (!user) {
      toast({ title: "Not logged in", description: "Please sign in to request a project." });
      return;
    }
    setIsRequestDialogOpen(true);
  };

  const handleArtworkClick = (art: any) => {
    setSelectedArtwork(art);
  };

  const closeModal = () => setSelectedArtwork(null);

  useEffect(() => {
    if (id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
      setProfileState(artistsData[id]);
      setFollowersCount(artistsData[id].followers);
    }
  }, [id]);

  if (!profileState) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <GlassCard className="p-4 sm:p-6 lg:p-8 text-center max-w-md w-full">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">Artist Not Found</h1>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">The artist you're looking for doesn't exist.</p>
            <GlassButton className="w-full sm:w-auto">
              <Link to="/explore">Browse Artists</Link>
            </GlassButton>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  const portfolio = profileState.artworks.map((a, ix) => ({
    ...a,
    likes: 100 + ix * 11,
    views: 500 + ix * 30,
    price: ix === 0 ? 0 : 499 + 100 * ix,
    isPremium: ix === 1,
    isExclusive: ix === 2,
  }));

  const pinnedArtworks = [portfolio[0]].filter(Boolean);
  const pinnedIds = pinnedArtworks.map((a) => a.id);
  const premiumArt = portfolio.filter((p) => p.isPremium);
  const exclusiveArt = portfolio.filter((p) => p.isExclusive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-gray-100 flex flex-col">
      <Navbar />
      
      {showDiagnosticBanner && (
        <div className="w-full bg-orange-200 py-2 px-3 sm:px-4 text-center text-orange-900 font-medium text-xs sm:text-sm">
          <span className="block sm:inline">
            Not logged in! Some actions are disabled.
            <span className="block sm:inline sm:ml-2">[Preview mode 💡]</span>
          </span>
        </div>
      )}
      
      <div className="pt-16 w-full">
        <ArtistHeader
          artist={{
            ...profileState,
            followers: followersCount,
            premium: true,
            tags: [profileState.category, ...(profileState.specialties || [])],
            views: portfolio.reduce((acc, a) => acc + (a.views || 0), 0),
            tagline: profileState.bio ?? "",
          }}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onMessage={handleMessage}
          isSaved={isSaved}
          onSave={handleToggleSave}
          onRequest={handleRequestProject}
          loadingFollow={loadingFollow}
          loadingSave={loadingSave}
        />
      </div>
      
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 flex-1 pb-4 sm:pb-6 lg:pb-8 mt-3 sm:mt-4 lg:mt-6">
        <TagDisplay tags={[profileState.category, ...(profileState.specialties || [])]} />
        <GlassCard className="p-3 sm:p-4 lg:p-6 xl:p-8 mt-3 sm:mt-4 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h2 className="font-heading text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
              Portfolio
            </h2>
          </div>
          <ArtistTabs
            allArt={portfolio}
            premiumArt={premiumArt}
            exclusiveArt={exclusiveArt}
            pinnedIds={pinnedIds}
            aboutDetails={{
              artist: profileState,
              projectsCount: 19,
              avgRating: 4.7,
              reviewCount: 12,
            }}
            onArtworkClick={handleArtworkClick}
          />
        </GlassCard>
        
        {selectedArtwork && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md sm:max-w-xl w-full relative p-3 sm:p-4 lg:p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-red-500 text-lg sm:text-xl font-bold z-10 p-1"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
              <img
                src={selectedArtwork.img}
                alt={selectedArtwork.title}
                className="w-full rounded-lg mb-3 sm:mb-4 object-cover max-h-40 sm:max-h-48 lg:max-h-64"
              />
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2">{selectedArtwork.title}</h3>
              <div className="flex flex-wrap gap-2 sm:gap-4 text-gray-600 text-xs sm:text-sm mb-2">
                <span>❤️ {selectedArtwork.likes}</span>
                <span>👁 {selectedArtwork.views}</span>
                {selectedArtwork.price !== undefined && (
                  <span>
                    {selectedArtwork.price === 0 ? "Free" : `₹${selectedArtwork.price}`}
                  </span>
                )}
                {selectedArtwork.isPremium && (
                  <span className="bg-yellow-200 rounded px-2 py-0.5 text-yellow-900 font-medium text-xs">
                    Premium
                  </span>
                )}
                {selectedArtwork.isExclusive && (
                  <span className="bg-purple-200 rounded px-2 py-0.5 text-purple-800 font-medium text-xs">
                    Exclusive
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base">
                {selectedArtwork.description || "No description for this artwork."}
              </p>
            </div>
          </div>
        )}
      </main>

      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md mx-3 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg lg:text-xl">Send Project Request</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Send a project request to {profileState?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            <div>
              <Label htmlFor="req-title" className="text-sm sm:text-base">Project Title</Label>
              <Input 
                id="req-title" 
                value={projectRequest.title} 
                onChange={(e) => setProjectRequest({...projectRequest, title: e.target.value})} 
                placeholder="e.g., Album Cover Design"
                className="text-sm sm:text-base min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="req-budget" className="text-sm sm:text-base">Budget (₹)</Label>
              <Input 
                id="req-budget" 
                type="number" 
                value={projectRequest.budget} 
                onChange={(e) => setProjectRequest({...projectRequest, budget: e.target.value})} 
                placeholder="e.g., 15000"
                className="text-sm sm:text-base min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="req-deadline" className="text-sm sm:text-base">Deadline</Label>
              <Input 
                id="req-deadline" 
                type="date" 
                value={projectRequest.deadline} 
                onChange={(e) => setProjectRequest({...projectRequest, deadline: e.target.value})}
                className="text-sm sm:text-base min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="req-description" className="text-sm sm:text-base">Project Description</Label>
              <Textarea 
                id="req-description" 
                value={projectRequest.description} 
                onChange={(e) => setProjectRequest({...projectRequest, description: e.target.value})} 
                placeholder="Describe your project requirements..." 
                rows={3}
                className="text-sm sm:text-base min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)} className="w-full sm:w-auto min-h-[44px]">
              Cancel
            </Button>
            <Button 
              onClick={handleSendProjectRequest} 
              disabled={sendProjectRequestMutation.isPending || !user}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {sendProjectRequestMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
