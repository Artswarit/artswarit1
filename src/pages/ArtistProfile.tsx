import { useParams, Link } from "react-router-dom";
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

  const [profileState, setProfileState] = useState(() => {
    // fallback demo data for local dev: artistData
    const demoArtist = artistsData[id as keyof typeof artistsData];
    return demoArtist;
  });

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(
    profileState?.followers || 0
  );
  const { toast } = useToast();
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Get supabase user (async)
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    })();
  }, []);

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
      if (userId) {
        const { data: following, error: followErr } = await supabase
          .from("follows")
          .select("id")
          .eq("artist_id", id)
          .eq("client_id", userId)
          .maybeSingle();
        setIsFollowing(!!following);
      }
    }
    fetchFollowersData();
    // re-run when id or userId changes
  }, [id, userId]);

  // Handle follow: demo fallback for demo artists, supabase for real
  const handleFollow = async () => {
    if (!id || !userId) {
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
        client_id: userId,
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
        .eq("client_id", userId);
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

  // These are demo-only, provide instant feedback via toast
  const handleMessage = () =>
    toast({ title: "Coming soon!", description: "Messaging will be available in a future update.", variant: "default" });

  const handleSave = () =>
    toast({ title: "Artist saved!", description: "Artist added to your saved list. (Demo only)", variant: "default" });

  const handleRequestProject = () =>
    toast({ title: "Coming soon!", description: "Request projects feature coming soon.", variant: "default" });

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
          onSave={handleSave}
          onRequest={handleRequestProject}
          loadingFollow={loadingFollow}
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
          />
        </GlassCard>
      </main>
      <Footer />
    </div>
  );
}
