import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassCard from "@/components/ui/glass-card";
import { User, Loader2 } from "lucide-react";

// Client Profile Components
import ClientProfileHeader from "@/components/client-profile/ClientProfileHeader";
import ClientWorkHistory from "@/components/client-profile/ClientWorkHistory";
import ClientReviews from "@/components/client-profile/ClientReviews";
import ClientTrustSignals from "@/components/client-profile/ClientTrustSignals";
import ClientBehaviorMetrics from "@/components/client-profile/ClientBehaviorMetrics";
import ClientAboutSection from "@/components/client-profile/ClientAboutSection";
import MessageClientDialog from "@/components/client-profile/MessageClientDialog";

interface ClientProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  is_verified: boolean | null;
  created_at: string | null;
  website: string | null;
  country_name: string | null;
  city: string | null;
}

interface WorkHistoryStats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  cancelledProjects: number;
  avgResponseTime: string | null;
  lastActive: string | null;
}

interface ReviewData {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  artist_name: string | null;
  artist_avatar: string | null;
  project_title: string | null;
}

interface TrustSignals {
  paymentVerified: boolean;
  onTimePaymentRate: number;
  disputeCount: number;
  escrowUsed: boolean;
  totalPayments: number;
}

interface BehaviorMetrics {
  rehireRate: number;
  avgBudget: number | null;
  minBudget: number | null;
  maxBudget: number | null;
  avgProjectDuration: string | null;
  totalHires: number;
  repeatHires: number;
}

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  
  const [workHistory, setWorkHistory] = useState<WorkHistoryStats>({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    cancelledProjects: 0,
    avgResponseTime: null,
    lastActive: null,
  });
  
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  
  const [trustSignals, setTrustSignals] = useState<TrustSignals>({
    paymentVerified: false,
    onTimePaymentRate: 0,
    disputeCount: 0,
    escrowUsed: false,
    totalPayments: 0,
  });
  
  const [behaviorMetrics, setBehaviorMetrics] = useState<BehaviorMetrics>({
    rehireRate: 0,
    avgBudget: null,
    minBudget: null,
    maxBudget: null,
    avgProjectDuration: null,
    totalHires: 0,
    repeatHires: 0,
  });

  const fetchAllData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch profile from public_profiles view (accessible to all)
      const { data: profileData, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !profileData) {
        console.error('Profile not found:', error);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Redirect artists to artist profile page
      if (profileData.role === 'artist') {
        navigate(`/artist/${id}`, { replace: true });
        return;
      }

      // Get country name from country_currencies table if we have a country code
      let countryName: string | null = profileData.location;

      setProfile({
        id: profileData.id || '',
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        cover_url: profileData.cover_url,
        bio: profileData.bio,
        location: profileData.location,
        is_verified: profileData.is_verified,
        created_at: profileData.created_at,
        website: profileData.website,
        country_name: countryName,
        city: null,
      });

      // Fetch all client statistics in parallel
      const [
        projectsResult,
        clientReviewsResult,
        conversationsResult,
      ] = await Promise.all([
        // Projects data
        supabase
          .from('projects')
          .select('id, status, budget, created_at, updated_at, artist_id')
          .eq('client_id', id),
        // Reviews received BY this client FROM artists
        supabase
          .from('client_reviews')
          .select(`
            id,
            rating,
            review_text,
            created_at,
            project_id,
            artist_id
          `)
          .eq('client_id', id)
          .order('created_at', { ascending: false }),
        // Get last activity from conversations
        supabase
          .from('conversations')
          .select('updated_at')
          .or(`client_id.eq.${id},artist_id.eq.${id}`)
          .order('updated_at', { ascending: false })
          .limit(1),
      ]);

      const projects = projectsResult.data || [];
      const clientReviewsData = clientReviewsResult.data || [];
      const lastConversation = conversationsResult.data?.[0];

      // Calculate work history stats
      const completed = projects.filter(p => p.status === 'completed').length;
      const inProgress = projects.filter(p => p.status === 'accepted').length;
      const cancelled = projects.filter(p => p.status === 'cancelled').length;
      const lastActive = lastConversation?.updated_at || profileData.created_at;

      setWorkHistory({
        totalProjects: projects.length,
        completedProjects: completed,
        inProgressProjects: inProgress,
        cancelledProjects: cancelled,
        avgResponseTime: completed > 0 ? '< 24h' : null,
        lastActive,
      });

      // Fetch artist details for reviews (reviews FROM artists)
      const reviewsWithArtists: ReviewData[] = [];
      for (const review of clientReviewsData.slice(0, 10)) {
        const { data: artistData } = await supabase
          .from('public_profiles')
          .select('full_name, avatar_url')
          .eq('id', review.artist_id)
          .maybeSingle();

        const { data: projectData } = await supabase
          .from('projects')
          .select('title')
          .eq('id', review.project_id)
          .maybeSingle();

        reviewsWithArtists.push({
          id: review.id,
          rating: review.rating,
          review_text: review.review_text,
          created_at: review.created_at,
          artist_name: artistData?.full_name || null,
          artist_avatar: artistData?.avatar_url || null,
          project_title: projectData?.title || null,
        });
      }
      setReviews(reviewsWithArtists);
      
      // Calculate average rating (ratings this client has RECEIVED from artists)
      const avgRating = clientReviewsData.length > 0
        ? clientReviewsData.reduce((sum, r) => sum + r.rating, 0) / clientReviewsData.length
        : 0;
      setAverageRating(avgRating);

      // Trust signals (simulated based on available data)
      const completionRate = projects.length > 0 ? (completed / projects.length) * 100 : 0;
      setTrustSignals({
        paymentVerified: completed > 0, // Assume verified if they've completed projects
        onTimePaymentRate: completed > 0 ? Math.min(100, completionRate + 20) : 0,
        disputeCount: 0, // No dispute tracking in current schema
        escrowUsed: false, // No escrow tracking in current schema
        totalPayments: completed,
      });

      // Behavior metrics
      const budgets = projects.filter(p => p.budget).map(p => p.budget as number);
      const avgBudget = budgets.length > 0 
        ? budgets.reduce((a, b) => a + b, 0) / budgets.length 
        : null;
      const minBudget = budgets.length > 0 ? Math.min(...budgets) : null;
      const maxBudget = budgets.length > 0 ? Math.max(...budgets) : null;

      // Calculate rehire rate (same artist hired multiple times)
      const artistIds = projects.map(p => p.artist_id).filter(Boolean);
      const uniqueArtists = new Set(artistIds);
      const repeatHires = artistIds.length - uniqueArtists.size;
      const rehireRate = uniqueArtists.size > 0 && artistIds.length > 1
        ? Math.round((repeatHires / (artistIds.length - 1)) * 100)
        : 0;

      setBehaviorMetrics({
        rehireRate,
        avgBudget,
        minBudget,
        maxBudget,
        avgProjectDuration: completed > 0 ? '1-2 weeks' : null,
        totalHires: artistIds.length,
        repeatHires,
      });

    } catch (err) {
      console.error('Error fetching client profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Real-time subscriptions for live updates
  useEffect(() => {
    if (!id) return;

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel(`client-profile-realtime:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${id}` },
        () => fetchAllData()
      )
      .subscribe();

    // Subscribe to client reviews changes (reviews FROM artists TO this client)
    const reviewsChannel = supabase
      .channel(`client-reviews-profile:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_reviews', filter: `client_id=eq.${id}` },
        () => fetchAllData()
      )
      .subscribe();

    // Subscribe to projects changes
    const projectsChannel = supabase
      .channel(`client-projects-realtime:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `client_id=eq.${id}` },
        () => fetchAllData()
      )
      .subscribe();

    // Subscribe to conversations for activity status
    const conversationsChannel = supabase
      .channel(`client-conversations-realtime:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload: any) => {
          if (payload.new?.client_id === id || payload.new?.artist_id === id) {
            fetchAllData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(reviewsChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [id, fetchAllData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 mt-16">
          <GlassCard className="p-8 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading client profile...</p>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 mt-16">
          <GlassCard className="p-8 text-center max-w-md w-full">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground">The client profile you're looking for doesn't exist.</p>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background">
      <Navbar />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 mt-16 pb-8">
        {/* Profile Header with Cover, Avatar, Name, Message Button */}
        <GlassCard className="overflow-hidden mb-6">
          <ClientProfileHeader
            profile={profile}
            lastActive={workHistory.lastActive}
            responseTime={workHistory.avgResponseTime}
            onMessageClick={() => setMessageDialogOpen(true)}
            isLoggedIn={isLoggedIn}
          />
        </GlassCard>

        <div className="space-y-6">
          {/* Work History & Reliability */}
          <ClientWorkHistory stats={workHistory} />

          {/* Reviews & Ratings */}
          <ClientReviews
            reviews={reviews}
            averageRating={averageRating}
            totalReviews={reviews.length}
          />

          {/* Payment & Trust Signals */}
          <ClientTrustSignals signals={trustSignals} />

          {/* Project Behavior Metrics */}
          <ClientBehaviorMetrics metrics={behaviorMetrics} />

          {/* About Section */}
          <ClientAboutSection
            bio={profile.bio}
            projectTypes={[]}
            workingStyle={null}
          />
        </div>
      </main>

      <Footer />

      {/* Message Dialog */}
      {user && (
        <MessageClientDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
          clientId={profile.id}
          clientName={profile.full_name || 'Client'}
          clientAvatar={profile.avatar_url || undefined}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}
