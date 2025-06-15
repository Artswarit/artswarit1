import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { Verified, MapPin, Users, Heart } from "lucide-react";
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

// --- Demo Data for fallback ---
const ARTIST_UUID_1 = "11111111-1111-1111-1111-111111111111";
const ARTIST_UUID_2 = "22222222-2222-2222-2222-222222222222";

const artistsData = {
  [ARTIST_UUID_1]: {
    id: ARTIST_UUID_1,
    name: "Alex Rivera",
    category: "Musician",
    avatar:
      "https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.0&auto=format&fit=crop&w=200&q=80",
    bio: "Multi-platinum musician passionate about creating moving music and telling stories.",
    followers: 12035,
    likes: 3204,
    isVerified: true,
    specialties: ["Pop", "Rock", "Electronic"],
    location: "Los Angeles, CA",
    cover:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    artworks: [
      {
        id: "a1",
        title: "Midnight Symphony",
        img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "a2",
        title: "Live Concert 2024",
        img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  [ARTIST_UUID_2]: {
    id: ARTIST_UUID_2,
    name: "Maya Johnson",
    category: "Writer",
    avatar:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80",
    bio: "Award-winning author, creative in fantasy and science fiction novels.",
    followers: 8621,
    likes: 1945,
    isVerified: true,
    specialties: ["Fantasy", "Sci-Fi", "Short Stories"],
    location: "New York, NY",
    cover:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    artworks: [
      {
        id: "b1",
        title: "Crystal Realm",
        img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
};

// Route adaptation: If /artist/1 or /artist/2, map to demo UUIDs
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

  const [profileState, setProfileState] = useState(() => {
    // fallback demo data for local dev: artistData
    const demoArtist = artistsData[id as keyof typeof artistsData];
    return demoArtist;
  });

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(
    profileState?.followers || 0
  );
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // State for project request dialog
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [projectRequest, setProjectRequest] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });

  // Get supabase user is now handled by useAuth

  // Fetch actual followers count & user following state
  useEffect(() => {
    async function fetchFollowersData() {
      // skip for demo profiles
      if (!id || id === ARTIST_UUID_1 || id === ARTIST_UUID_2) return;

      // total followers for this artist
      const { data: followers, error: countErr } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: false })
        .eq("artist_id", id);

      if (!countErr && followers) {
        setFollowersCount(followers.length);
      }
      // check if this user is following the artist
      if (user?.id) {
        const { data: following, error: followErr } = await supabase
          .from("follows")
          .select("id")
          .eq("artist_id", id)
          .eq("client_id", user.id)
          .maybeSingle();
        setIsFollowing(!!following);
      }
    }
    fetchFollowersData();
    // re-run when id or userId changes
  }, [id, user?.id]);

  // Fetch saved artist status
  useEffect(() => {
    async function checkSavedStatus() {
      if (!id || !user?.id || id === ARTIST_UUID_1 || id === ARTIST_UUID_2) return;

      const { data, error } = await supabase
        .from('saved_artists')
        .select('id')
        .eq('artist_id', id)
        .eq('client_id', user.id)
        .maybeSingle();
      
      if (!error) {
        setIsSaved(!!data);
      }
    }

    if (user?.id) {
      checkSavedStatus();
    }
  }, [id, user?.id]);

  // Handle follow: demo fallback for demo artists, supabase for real
  const handleFollow = async () => {
    if (!id || !user?.id) {
      toast({
        title: "Not logged in",
        description: "Please sign in to follow artists.",
      });
      return;
    }

    // Demo profiles: local state only!
    if (id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
      setLoadingFollow(true);
      if (!isFollowing) {
        setIsFollowing(true);
        setFollowersCount((cnt) => cnt + 1);
        toast({
          title: "Followed (Demo)",
          description: "You are now following this artist! (Demo artist profile)",
        });
      } else {
        setIsFollowing(false);
        setFollowersCount((cnt) => Math.max(cnt - 1, 0));
        toast({
          title: "Unfollowed (Demo)",
          description: "You have unfollowed this artist. (Demo artist profile)",
        });
      }
      setLoadingFollow(false);
      return;
    }

    setLoadingFollow(true);
    if (!isFollowing) {
      // follow in supabase
      const { error } = await supabase.from("follows").insert({
        artist_id: id,
        client_id: user.id,
      });
      if (!error) {
        setIsFollowing(true);
        setFollowersCount((cnt) => cnt + 1);
        toast({
          title: "Followed",
          description: "You are now following this artist!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong while following.",
        });
      }
    } else {
      // unfollow in supabase
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("artist_id", id)
        .eq("client_id", user.id);
      if (!error) {
        setIsFollowing(false);
        setFollowersCount((cnt) => Math.max(cnt - 1, 0));
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this artist.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not unfollow artist.",
        });
      }
    }
    setLoadingFollow(false);
  };

  // Fixed message handler - now shows proper demo feedback
  const handleMessage = () => {
    console.log("Message button clicked"); // Debug log
    
    if (!user?.id) {
      toast({
        title: "Not logged in",
        description: "Please sign in to message artists.",
      });
      return;
    }

    if (id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
      toast({
        title: "Demo Message",
        description: `This is a demo profile. In a real app, you would be able to message ${profileState?.name}.`,
      });
    } else {
      toast({
        title: "Coming soon!",
        description: "Messaging will be available in a future update.",
      });
    }
  };

  // Fixed save handler - now works for demo artists too
  const handleToggleSave = async () => {
    console.log("Save button clicked"); // Debug log
    
    if (!id || !user?.id) {
      toast({
        title: "Not logged in",
        description: "Please sign in to save artists.",
      });
      return;
    }

    // For demo artists, simulate save/unsave
    if (id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
      setLoadingSave(true);
      // Simulate loading delay
      setTimeout(() => {
        setIsSaved(!isSaved);
        toast({
          title: isSaved ? "Artist Unsaved (Demo)" : "Artist Saved! (Demo)",
          description: `This is a demo profile. In a real app, ${profileState?.name} would be ${isSaved ? 'removed from' : 'added to'} your saved artists.`,
        });
        setLoadingSave(false);
      }, 500);
      return;
    }

    setLoadingSave(true);
    if (isSaved) {
      // Unsave logic
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
      // Save logic
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
      toast({
        title: "Not logged in",
        description: "Please sign in to request a project.",
      });
      return;
    }
    setIsRequestDialogOpen(true);
  };

  // Add state for the modal and selected artwork
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);

  // Function to handle artwork click and show modal
  const handleArtworkClick = (art: any) => {
    setSelectedArtwork(art);
  };

  // Function to close modal
  const closeModal = () => setSelectedArtwork(null);

  if (!profileState) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <GlassCard className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Artist Not Found</h1>
            <p className="text-muted-foreground mb-4">The artist you're looking for doesn't exist.</p>
            <GlassButton>
              <Link to="/explore">Browse Artists</Link>
            </GlassButton>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  // Demo logic: show enriched data with new followersCount from DB, not from static mock
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
      <main className="container max-w-screen-xl mx-auto flex-1 px-2 sm:px-6 pb-8 mt-6">
        <TagDisplay tags={[profileState.category, ...(profileState.specialties || [])]} />
        <GlassCard className="p-7 md:p-8 mt-4 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-heading text-lg md:text-xl font-bold text-gray-900">
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
        
        {/* Artwork Details Modal */}
        {selectedArtwork && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-xl w-full relative p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
              <img
                src={selectedArtwork.img}
                alt={selectedArtwork.title}
                className="w-full rounded-lg mb-4 object-cover max-h-64"
              />
              <h3 className="text-xl font-bold mb-2">{selectedArtwork.title}</h3>
              <div className="flex gap-4 text-gray-600 text-sm mb-2">
                <span>❤️ {selectedArtwork.likes}</span>
                <span>👁 {selectedArtwork.views}</span>
                {selectedArtwork.price !== undefined && (
                  <span>
                    {selectedArtwork.price === 0 ? "Free" : `₹${selectedArtwork.price}`}
                  </span>
                )}
                {selectedArtwork.isPremium && (
                  <span className="bg-yellow-200 rounded px-2 py-0.5 text-yellow-900 font-medium">
                    Premium
                  </span>
                )}
                {selectedArtwork.isExclusive && (
                  <span className="bg-purple-200 rounded px-2 py-0.5 text-purple-800 font-medium">
                    Exclusive
                  </span>
                )}
              </div>
              <p className="text-gray-700">
                {selectedArtwork.description || "No description for this artwork."}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Project Request Modal */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Project Request</DialogTitle>
            <DialogDescription>
              Send a project request to {profileState?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="req-title">Project Title</Label>
              <Input 
                id="req-title" 
                value={projectRequest.title} 
                onChange={(e) => setProjectRequest({...projectRequest, title: e.target.value})} 
                placeholder="e.g., Album Cover Design" 
              />
            </div>
            <div>
              <Label htmlFor="req-budget">Budget (₹)</Label>
              <Input 
                id="req-budget" 
                type="number" 
                value={projectRequest.budget} 
                onChange={(e) => setProjectRequest({...projectRequest, budget: e.target.value})} 
                placeholder="e.g., 15000" 
              />
            </div>
            <div>
              <Label htmlFor="req-deadline">Deadline</Label>
              <Input 
                id="req-deadline" 
                type="date" 
                value={projectRequest.deadline} 
                onChange={(e) => setProjectRequest({...projectRequest, deadline: e.target.value})} 
              />
            </div>
            <div>
              <Label htmlFor="req-description">Project Description</Label>
              <Textarea 
                id="req-description" 
                value={projectRequest.description} 
                onChange={(e) => setProjectRequest({...projectRequest, description: e.target.value})} 
                placeholder="Describe your project requirements..." 
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendProjectRequest} disabled={sendProjectRequestMutation.isPending}>
              {sendProjectRequestMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
