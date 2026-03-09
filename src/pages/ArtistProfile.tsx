
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
import { Heart, Eye, Flag, Ban } from "lucide-react";
import MessageArtistDialog from "@/components/artist-profile/MessageArtistDialog";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import ReportDialog from "@/components/reports/ReportDialog";
import BlockUserButton from "@/components/blocks/BlockUserButton";
import { useArtistAvailability } from "@/hooks/useArtistAvailability";
import { format as formatDate } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";
import LogoLoader from "@/components/ui/LogoLoader";

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
    isVerified: false,
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
    isVerified: false,
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
  const { format, userCurrencySymbol } = useCurrencyFormat();
  const [loading, setLoading] = useState(true);
  const [artistSettings, setArtistSettings] = useState<{ profileVisibility: boolean; allowDirectMessages: boolean; vacationMode: boolean; showEarnings: boolean }>({
    profileVisibility: true,
    allowDirectMessages: true,
    vacationMode: false,
    showEarnings: false
  });
  const { availability, isOnVacation, nextVacationStart, nextVacationEnd, nextVacationNote, nextBusyStart, nextBusyEnd, nextBusyNote, lastVacationSetDate, lastBusySetDate } = useArtistAvailability(id);

  // DIAGNOSTIC: Show login state and preview context

  const [profileState, setProfileState] = useState<any>(() => {
    // fallback demo data for local dev: artistData
    const demoArtist = artistsData[id as keyof typeof artistsData];
    return demoArtist;
  });

  const [artistServices, setArtistServices] = useState<any[]>([]);
  const [artistReviews, setArtistReviews] = useState<any[]>([]);
  const [completedProjectsCount, setCompletedProjectsCount] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
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

  // State for message dialog
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  
  // State for report dialog
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Fetch real artist profile from database
  useEffect(() => {
    async function fetchArtistProfile() {
      // Skip for demo profiles
      if (!id || id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First check if this is actually an artist profile
        const { data: profileCheck } = await supabase
          .from('public_profiles')
          .select('role')
          .eq('id', id)
          .maybeSingle();
        
        // If the profile is a client, redirect to the user profile page
        if (profileCheck && profileCheck.role === 'client') {
          navigate(`/profile/${id}`, { replace: true });
          return;
        }
        
        // Fetch artist info from public_profiles view (has avatar_url and cover_url)
        const [profileResult, artworksResult, followersResult, servicesResult, reviewsResult, projectsResult] = await Promise.all([
          supabase
            .from('public_profiles')
            .select('*')
            .eq('id', id)
            .maybeSingle(),
          supabase
            .from('artworks')
            .select('*')
            .eq('artist_id', id)
            .eq('status', 'public')
            .order('created_at', { ascending: false }),
          supabase
            .from('follows')
            .select('id')
            .eq('following_id', id),
          supabase
            .from('artist_services')
            .select('*')
            .eq('artist_id', id)
            .order('created_at', { ascending: false }),
          supabase
            .from('project_reviews')
            .select('*')
            .eq('artist_id', id)
            .order('created_at', { ascending: false }),
          supabase
            .from('projects')
            .select('id')
            .eq('artist_id', id)
            .eq('status', 'completed')
        ]);

        const artistData = profileResult.data;
        const artworksData = artworksResult.data || [];
        const followersData = followersResult.data || [];
        const servicesData = servicesResult.data || [];
        const reviewsData = reviewsResult.data || [];
        const completedProjects = projectsResult.data || [];
        
        // Set completed projects count
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const { data: monthlyEarningsData } = await supabase
          .from('transactions')
          .select('amount')
          .eq('seller_id', id)
          .eq('status', 'success')
          .gte('created_at', monthStart.toISOString());
        const computedMonthly = (monthlyEarningsData ?? []).reduce(
          (sum: number, row: any) => sum + (Number(row.amount) || 0),
          0
        );
        setMonthlyEarnings(computedMonthly);

        setCompletedProjectsCount(completedProjects.length);


        // Get all artwork IDs to fetch likes
        const artworkIds = artworksData.map(a => a.id);
        
        // Fetch total likes for all artworks
        let totalLikes = 0;
        if (artworkIds.length > 0) {
          const { data: likesData } = await supabase
            .from('artwork_likes')
            .select('id')
            .in('artwork_id', artworkIds);
          totalLikes = likesData?.length || 0;
        }

        // Get like counts per artwork
        const likesPerArtwork: Record<string, number> = {};
        if (artworkIds.length > 0) {
          const { data: allLikes } = await supabase
            .from('artwork_likes')
            .select('artwork_id')
            .in('artwork_id', artworkIds);
          
          (allLikes || []).forEach(like => {
            if (like.artwork_id) {
              likesPerArtwork[like.artwork_id] = (likesPerArtwork[like.artwork_id] || 0) + 1;
            }
          });
        }

        // Get view counts per artwork
        const viewsPerArtwork: Record<string, number> = {};
        if (artworkIds.length > 0) {
          const { data: allViews } = await supabase
            .from('artwork_views')
            .select('artwork_id')
            .in('artwork_id', artworkIds);
          
          (allViews || []).forEach(view => {
            if (view.artwork_id) {
              viewsPerArtwork[view.artwork_id] = (viewsPerArtwork[view.artwork_id] || 0) + 1;
            }
          });
        }

        if (!artistData) {
          setProfileState(null);
          setLoading(false);
          return;
        }

        // Build profile from public_profiles data
        const artistProfile = {
          id: artistData.id,
          name: artistData.full_name || 'Unknown Artist',
          category: artistData.role || 'Artist',
          avatar: artistData.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
          bio: artistData.bio || '',
          followers: followersData.length,
          likes: totalLikes,
          isVerified: artistData.is_verified || false,
          specialties: artistData.tags || [],
          location: artistData.location || '',
          cover: (artistData as any).cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
          artworks: artworksData.map(art => ({
            id: art.id,
            title: art.title,
            img: art.media_url,
            type: art.media_type,
            likes: likesPerArtwork[art.id] || 0,
            views: viewsPerArtwork[art.id] || 0,
            price: art.price || 0,
            currency: (art.metadata as any)?.currency || 'USD',
            metadata: art.metadata, // Include metadata for access_type
            access_type: (art.metadata as any)?.access_type || 'free',
          })),
        };

        setProfileState(artistProfile);
        setFollowersCount(followersData.length);
        setArtistServices(servicesData);

        // Enrich reviews with client info — all in parallel
        const enrichedReviews = await Promise.all(
          reviewsData.map(async (rev) => {
            const { data: clientData } = await supabase
              .from('public_profiles')
              .select('full_name, avatar_url')
              .eq('id', rev.client_id)
              .maybeSingle();
            return {
              ...rev,
              clientName: clientData?.full_name || 'Anonymous',
              clientAvatar: clientData?.avatar_url || null,
              artist_response: rev.artist_response,
              artist_response_at: rev.artist_response_at,
            };
          })
        );
        setArtistReviews(enrichedReviews);
      } catch (err) {
        setProfileState(null);
      } finally {
        setLoading(false);
      }
    }

    fetchArtistProfile();
  }, [id]);

  // Load visibility/messaging/vacation settings — try auth route first, then public fallback
  useEffect(() => {
    const loadSettings = async () => {
      if (!id) return;

      // Try the auth-protected profiles table first (artist viewing own profile)
      let profileData: any = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('social_links, profile_visibility, is_on_vacation')
          .eq('id', id)
          .maybeSingle();
        profileData = data;
      } catch (_) { /* RLS may block non-auth reads — fall through */ }

      // Fallback: public_profiles view is always readable
      if (!profileData) {
        const { data: pub } = await supabase
          .from('public_profiles')
          .select('social_links, profile_visibility, is_on_vacation')
          .eq('id', id)
          .maybeSingle();
        profileData = pub;
      }

      type ProfileRow = import('@/integrations/supabase/types').Tables<'profiles'>;
      const sl = profileData?.social_links as ProfileRow['social_links'];
      const saved = (() => {
        if (!sl || typeof sl !== 'object') return {};
        const obj = sl as Record<string, unknown>;
        const maybe = obj['settings'];
        return typeof maybe === 'object' && maybe
          ? (maybe as { profileVisibility?: boolean; allowDirectMessages?: boolean; vacationMode?: boolean; showEarnings?: boolean })
          : {};
      })();

      setArtistSettings({
        profileVisibility: profileData?.profile_visibility ?? saved.profileVisibility ?? true,
        allowDirectMessages: saved.allowDirectMessages ?? true,
        vacationMode: (profileData?.is_on_vacation ?? saved.vacationMode ?? false) as boolean,
        showEarnings: saved.showEarnings ?? false,
      });
    };

    loadSettings();
    if (!id) return;
    const channel = supabase
      .channel(`artist-profile-settings:${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${id}` }, loadSettings)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Check if current user is the artist (owner)
  const isArtistOwner = user?.id === id;
  if (!isArtistOwner && artistSettings.profileVisibility === false) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <GlassCard className="p-8 text-center">
            <p className="text-lg font-bold">This artist profile is currently not publicly visible.</p>
            <p className="mt-2 text-muted-foreground">Please check back later.</p>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  // Refresh reviews function
  const refreshReviews = async () => {
    if (!id) return;
    
    try {
      const { data: reviewsData } = await supabase
        .from('project_reviews')
        .select('*')
        .eq('artist_id', id)
        .order('created_at', { ascending: false });

      // Parallel enrichment
      const enrichedReviews = await Promise.all(
        (reviewsData || []).map(async (rev) => {
          const { data: clientData } = await supabase
            .from('public_profiles')
            .select('full_name, avatar_url')
            .eq('id', rev.client_id)
            .maybeSingle();
          return {
            ...rev,
            clientName: clientData?.full_name || 'Anonymous',
            clientAvatar: clientData?.avatar_url || null,
            artist_response: rev.artist_response,
            artist_response_at: rev.artist_response_at,
          };
        })
      );
      setArtistReviews(enrichedReviews);
    } catch { /* silent */ }
  };

  // Get supabase user is now handled by useAuth

  // Fetch actual followers count & user following state + Real-time subscriptions
  useEffect(() => {
    async function fetchFollowersData() {
      // skip for demo profiles
      if (!id || id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
        console.log("[ARTIST PROFILE] Demo/fallback profile - skipping real DB fetch");
        return;
      }

      // total followers for this artist
      const { data: followers, error: countErr } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: false })
        .eq("following_id", id);

      if (!countErr && followers) {
        setFollowersCount(followers.length);
      }
      // check if this user is following the artist
      if (user?.id) {
        const { data: following, error: followErr } = await supabase
          .from("follows")
          .select("id")
          .eq("following_id", id)
          .eq("follower_id", user.id)
          .maybeSingle();
        setIsFollowing(!!following);
      }
    }
    fetchFollowersData();

    // Real-time subscription for follows
    if (id && id !== ARTIST_UUID_1 && id !== ARTIST_UUID_2) {
      const followsChannel = supabase
        .channel(`artist-follows-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'follows',
            filter: `following_id=eq.${id}`
          },
          async (payload) => {
            // Refetch followers count
            const { data: followers } = await supabase
              .from("follows")
              .select("id")
              .eq("following_id", id);
            setFollowersCount(followers?.length || 0);
            
            // Also update the current user's following status
            if (user?.id) {
              const newRecord = payload.new as { follower_id?: string } | null;
              const oldRecord = payload.old as { follower_id?: string } | null;
              
              if (payload.eventType === 'INSERT' && newRecord?.follower_id === user.id) {
                setIsFollowing(true);
              } else if (payload.eventType === 'DELETE' && oldRecord?.follower_id === user.id) {
                setIsFollowing(false);
              }
            }
          }
        )
        .subscribe();

      // Real-time subscription for reviews
      const reviewsChannel = supabase
        .channel(`artist-reviews-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_reviews',
            filter: `artist_id=eq.${id}`
          },
          () => {
            refreshReviews();
          }
        )
        .subscribe();

      // Real-time subscription for completed projects (to update stats)
      const projectsChannel = supabase
        .channel(`artist-projects-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `artist_id=eq.${id}`
          },
          async () => {
            // Refresh completed projects count when projects change
            const { data: projectsData } = await supabase
              .from('projects')
              .select('id')
              .eq('artist_id', id)
              .eq('status', 'completed');
            
            setCompletedProjectsCount(projectsData?.length || 0);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(followsChannel);
        supabase.removeChannel(reviewsChannel);
        supabase.removeChannel(projectsChannel);
      };
    }
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
      // Ensure the user exists in the users table (required by foreign key)
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingUser) {
        // User doesn't exist in users table - create them
        const { error: userError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          role: "client",
        });

        if (userError) {
          // Continue anyway - they might just need to be in profiles
        }
      }

      // follow in supabase
      const { error } = await supabase.from("follows").insert({
        following_id: id,
        follower_id: user.id,
      });
      if (!error) {
        setIsFollowing(true);
        setFollowersCount((cnt) => cnt + 1);
        toast({
          title: "Followed",
          description: "You are now following this artist!",
        });
      } else {
        console.error("Follow error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Something went wrong while following.",
        });
      }
    } else {
      // unfollow in supabase
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("following_id", id)
        .eq("follower_id", user.id);
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

  // Message handler
  const handleMessage = () => {
    if (!user?.id) {
      toast({
        title: "Not logged in",
        description: "Please sign in to message artists.",
      });
      return;
    }
    if (artistSettings.allowDirectMessages === false) {
      toast({
        title: "Messaging disabled",
        description: "This artist has disabled direct messages.",
      });
      return;
    }
    if (id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
      toast({
        title: "Demo Message",
        description: `This is a demo profile. In a real app, you would be able to message ${profileState?.name}.`,
      });
      return;
    }
    setIsMessageDialogOpen(true);
  };

  // Save handler
  const handleToggleSave = async () => {
    if (!id || !user?.id) {
      toast({
        title: "Not logged in",
        description: "Please sign in to save artists.",
      });
      return;
    }
    // Demo state
    if (id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
      setLoadingSave(true);
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
    if (!isArtistOwner && artistSettings.vacationMode === true) {
      toast({
        title: "Artist unavailable",
        description: "This artist is currently on vacation and not accepting new requests.",
      });
      return;
    }
    setIsRequestDialogOpen(true);
  };

  const handleArtworkClick = (art: any) => {
    if (!art?.id) return;
    navigate(`/artwork/${art.id}`);
  };

  // Extra robust: always show demo data for /artist/1 and /artist/2, regardless of login
  useEffect(() => {
    if (id === ARTIST_UUID_1 || id === ARTIST_UUID_2) {
      setProfileState(artistsData[id]);
      setFollowersCount(artistsData[id].followers);
    }
  }, [id]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <LogoLoader text="Loading artist profile..." />
        </div>
        <Footer />
      </div>
    );
  }

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

  // Use real data for artworks, only add demo values for demo profiles
  const isDemoProfile = id === ARTIST_UUID_1 || id === ARTIST_UUID_2;
  const portfolio = (profileState.artworks || []).map((a: any, ix: number) => {
    // Extract access_type from metadata for real artworks
    const accessType = a.metadata?.access_type || a.access_type || 'free';
    const artworkPrice = a.price ?? (isDemoProfile ? (ix === 0 ? 0 : 499 + 100 * ix) : 0);
    
    // CRITICAL: If price is 0 or null/undefined, treat as FREE regardless of access_type
    // Premium requires both access_type = 'premium' AND price > 0
    // Exclusive requires access_type = 'exclusive' AND price > 0 (or request-based)
    const hasPrice = artworkPrice !== null && artworkPrice !== undefined && artworkPrice > 0;
    const isPremiumArt = (accessType === 'premium' && hasPrice) || (isDemoProfile && ix === 1 && hasPrice);
    const isExclusiveArt = accessType === 'exclusive' || (isDemoProfile && ix === 2);
    
    return {
      ...a,
      likes: a.likes || (isDemoProfile ? 100 + ix * 11 : 0),
      views: a.views || (isDemoProfile ? 500 + ix * 30 : 0),
      price: artworkPrice,
      isPremium: isPremiumArt && !isExclusiveArt, // Premium but not exclusive
      isExclusive: isExclusiveArt,
      artistId: id,
      artistName: profileState.name,
      category: profileState.category,
      type: a.type || 'image',
      accessType: hasPrice ? accessType : 'free', // Override access type if no price
    };
  });

  const pinnedArtworks = [portfolio[0]].filter(Boolean);
  const pinnedIds = pinnedArtworks.map((a: any) => a.id);

  // Filter artworks by access type
  const premiumArt = portfolio.filter((p: any) => p.isPremium);
  const exclusiveArt = portfolio.filter((p: any) => p.isExclusive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-gray-100 flex flex-col">
      <Navbar />
      
      {/* Artist Header - responsive spacing */}
      <div className="pt-16 w-full">
        <ArtistHeader
          artist={{
            ...profileState,
            followers: followersCount,
            premium: true,
            tags: [profileState.category, ...(profileState.specialties || [])],
            views: portfolio.reduce((acc, a) => acc + (a.views || 0), 0),
            tagline: profileState.bio ?? "",
            // Real stats for Artist Overview section
            totalProjects: completedProjectsCount,
            rating: artistReviews.length > 0 
              ? artistReviews.reduce((sum, r) => sum + r.rating, 0) / artistReviews.length 
              : 0,
            reviewCount: artistReviews.length,
          }}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onMessage={handleMessage}
            canMessage={artistSettings.allowDirectMessages}
          isSaved={isSaved}
          onSave={handleToggleSave}
          onRequest={handleRequestProject}
          loadingFollow={loadingFollow}
          loadingSave={loadingSave}
        />
      </div>
      
      {(
        artistSettings.vacationMode ||
        isOnVacation ||
        (nextVacationStart && nextVacationEnd) ||
        (nextBusyStart && nextBusyEnd)
      ) && (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 mt-3">
          {/*
            Prefer showing Busy dates when vacation mode is on but there is no vacation range.
            Otherwise show Vacation if its range exists; else Busy if that exists.
          */}
          {(() => {
            const hasVac = !!nextVacationStart || !!nextVacationEnd;
            const hasBusy = !!nextBusyStart || !!nextBusyEnd;
            const showBusy =
              (!hasVac && hasBusy) ||
              (!artistSettings.vacationMode && !isOnVacation && hasBusy);
            const bannerClass = showBusy
              ? 'border-amber-200/60 dark:border-amber-800 bg-card/50 backdrop-blur-sm'
              : 'border-red-200/60 dark:border-red-800 bg-card/50 backdrop-blur-sm';
            const accentText = showBusy
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-red-700 dark:text-red-400';
            const scheduledVac = !showBusy && nextVacationStart && new Date(nextVacationStart) > new Date();
            return (
              <div
                className={`group flex items-center justify-between rounded-xl px-4 py-3 border shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${bannerClass}`}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`grid place-items-center rounded-lg p-2 ${showBusy ? 'bg-amber-100/60' : 'bg-red-100/60'}`}>
                    <Calendar className={`${showBusy ? 'text-amber-700' : 'text-red-700'} w-4 h-4`} aria-hidden="true" />
                  </span>
                  <span className={`text-xs sm:text-sm font-black uppercase tracking-widest ${accentText}`}>
                    {showBusy ? 'Busy' : 'Vacation'}
                  </span>
                  {showBusy ? (
                    <>
                      {/* removed duplicate status word */}
                      {(nextBusyStart || nextBusyEnd) && (
                        <span className="text-xs sm:text-sm font-semibold text-foreground">
                          {nextBusyStart && formatDate(new Date(nextBusyStart), 'MMM d, yyyy')}
                          {nextBusyStart && nextBusyEnd && ' - '}
                          {nextBusyEnd && formatDate(new Date(nextBusyEnd), 'MMM d, yyyy')}
                        </span>
                      )}
                      {/* removed Set on timestamp */}
                    </>
                  ) : (
                    <>
                      {/* removed duplicate status word */}
                      {(nextVacationStart || nextVacationEnd) && (
                        <span className="text-xs sm:text-sm font-semibold text-foreground">
                          {nextVacationStart && formatDate(new Date(nextVacationStart), 'MMM d, yyyy')}
                          {nextVacationStart && nextVacationEnd && ' - '}
                          {nextVacationEnd && formatDate(new Date(nextVacationEnd), 'MMM d, yyyy')}
                        </span>
                      )}
                      {/* removed Set on timestamp */}
                    </>
                  )}
                </div>
                {/* removed trailing Updated label for minimal banner */}
              </div>
            );
          })()}
        </div>
      )}
      
      {artistSettings.showEarnings && (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 mt-3">
          <div
            className="group flex items-center justify-between rounded-xl px-4 py-3 border border-emerald-200/60 dark:border-emerald-800 bg-card/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
            aria-label="Monthly earnings"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="grid place-items-center rounded-lg p-2 bg-emerald-100/60">
                <TrendingUp className="text-emerald-700 w-4 h-4" aria-hidden="true" />
              </span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Earnings
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-foreground">
                {format(monthlyEarnings)}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] sm:text-xs text-muted-foreground">
              This month
            </div>
          </div>
        </div>
      )}
      
      {/* Main content - responsive container with proper spacing */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 flex-1 pb-4 sm:pb-6 lg:pb-8 mt-3 sm:mt-4 lg:mt-6">
        <TagDisplay tags={[profileState.category, ...(profileState.specialties || [])]} />
        <GlassCard className="p-3 sm:p-4 lg:p-6 xl:p-8 mt-3 sm:mt-4 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h2 className="font-heading text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
              Portfolio
            </h2>
          </div>
          <ArtistTabs
            artistId={id || ''}
            allArt={portfolio}
            premiumArt={premiumArt}
            exclusiveArt={exclusiveArt}
            pinnedIds={pinnedIds}
            aboutDetails={{
              artist: profileState,
              projectsCount: completedProjectsCount,
              avgRating: artistReviews.length > 0 
                ? artistReviews.reduce((sum, r) => sum + r.rating, 0) / artistReviews.length 
                : 0,
              reviewCount: artistReviews.length,
            }}
            services={artistServices}
            reviews={artistReviews}
            onArtworkClick={handleArtworkClick}
            isArtistOwner={isArtistOwner}
            onRefreshReviews={refreshReviews}
            currentUserId={user?.id || null}
          />
        </GlassCard>
      </main>

      {/* Project Request Modal - Full form with milestones */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Project Request</DialogTitle>
            <DialogDescription>
              Send a detailed project request to {profileState?.name}
            </DialogDescription>
          </DialogHeader>
          <CreateProjectForm 
            artistId={id}
            onSuccess={() => {
              setIsRequestDialogOpen(false);
              toast({ title: "Project request sent successfully!" });
            }}
            onCancel={() => setIsRequestDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Message Artist Dialog */}
      {user && id && id !== ARTIST_UUID_1 && id !== ARTIST_UUID_2 && (
        <MessageArtistDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          artistId={id}
          artistName={profileState?.name || "Artist"}
          artistAvatar={profileState?.avatar}
          currentUserId={user.id}
        />
      )}

      {/* Report Dialog */}
      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        contentType="user"
        contentId={id || ''}
      />
      
      <Footer />
    </div>
  );
}
