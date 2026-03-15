import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FollowersList } from "@/components/dashboard/FollowersList";
import { useRealtimeSync } from "@/lib/realtime-sync";

interface DashboardHeaderProps {
  user?: any;
  profile?: any;
  title: string;
  subtitle: string;
}

type ArtistStats = {
  totalViews: number;
  monthlyEarnings: number;
  totalArtworks: number;
  followers: number;
};

const DashboardHeader = ({ user, profile, title, subtitle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { format } = useCurrencyFormat();
  const [artistStats, setArtistStats] = useState<ArtistStats>({
    totalViews: 0,
    monthlyEarnings: 0,
    totalArtworks: 0,
    followers: 0,
  });
  const [openFollowers, setOpenFollowers] = useState(false);

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    if (!user?.id) return;
    
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    try {
      const [artworksCountRes, followersCountRes, earningsRes, monthlyEarningsRes, artworksViewsRes] =
        await Promise.all([
          supabase
            .from("artworks")
            .select("id", { count: "exact", head: true })
            .eq("artist_id", user.id)
            .abortSignal(signal),
          supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("following_id", user.id)
            .abortSignal(signal),
          supabase
            .from("transactions")
            .select("amount")
            .eq("seller_id", user.id)
            .eq("status", "success")
            .abortSignal(signal),
          supabase
            .from("transactions")
            .select("amount")
            .eq("seller_id", user.id)
            .eq("status", "success")
            .gte("created_at", monthStart.toISOString())
            .abortSignal(signal),
          supabase
            .from("artworks")
            .select("metadata")
            .eq("artist_id", user.id)
            .abortSignal(signal),
        ]);

      const isAbortError = (error: any) => 
        error?.name === 'AbortError' || 
        error?.message === 'AbortError: signal is aborted without reason' ||
        error?.message?.includes('Fetch aborted') ||
        error?.message?.includes('signal is aborted');

      if (
        (artworksCountRes.error && !isAbortError(artworksCountRes.error)) ||
        (followersCountRes.error && !isAbortError(followersCountRes.error)) ||
        (earningsRes.error && !isAbortError(earningsRes.error)) ||
        (monthlyEarningsRes.error && !isAbortError(monthlyEarningsRes.error)) ||
        (artworksViewsRes.error && !isAbortError(artworksViewsRes.error))
      ) {
        return;
      }

      const totalEarnings = (earningsRes.data ?? []).reduce(
        (sum, row) => sum + (Number(row.amount) || 0),
        0
      );
      const monthlyEarnings = (monthlyEarningsRes.data ?? []).reduce(
        (sum, row) => sum + (Number(row.amount) || 0),
        0
      );
      const totalViews = (artworksViewsRes.data ?? []).reduce((sum, row: any) => {
        const metadata = row?.metadata as any;
        const views = Number(metadata?.views_count ?? metadata?.views ?? metadata?.viewsCount ?? 0) || 0;
        return sum + views;
      }, 0);

      setArtistStats({
        totalViews,
        monthlyEarnings,
        totalArtworks: artworksCountRes.count ?? 0,
        followers: followersCountRes.count ?? 0,
      });
    } catch (err: any) {
      // Fetch error handled
    }
  }, [user?.id]);

  // Use Realtime Sync for multi-tab updates
  useRealtimeSync('artworks', fetchStats);
  useRealtimeSync('profile', fetchStats);
  useRealtimeSync('all', fetchStats);

  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();
    fetchStats(controller.signal);

    const channel = supabase
      .channel(`artist-dashboard-stats:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "artworks", filter: `artist_id=eq.${user.id}` },
        () => fetchStats()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "follows", filter: `following_id=eq.${user.id}` },
        () => fetchStats()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `seller_id=eq.${user.id}` },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      controller.abort();
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchStats]);

  return (
    <div className="space-y-4 sm:space-y-8 py-3 sm:py-6 my-2 sm:my-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-6 px-1">
        <div className="space-y-1 sm:space-y-3 max-w-2xl">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-[1.1] animate-in fade-in slide-in-from-left-4 duration-500">{title}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed font-medium opacity-80 animate-in fade-in slide-in-from-left-6 duration-700">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="overflow-hidden border-border/40 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300 group bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl">
          <CardContent className="flex items-center p-3 sm:p-5">
            <div className="mr-3 sm:mr-4 bg-purple-500/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5 sm:mb-1 opacity-70">Views</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground truncate tracking-tight">{artistStats.totalViews.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {(profile?.show_earnings ?? (profile?.social_links?.settings?.showEarnings ?? true)) && (
          <Card className="overflow-hidden border-border/40 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300 group bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl">
            <CardContent className="flex items-center p-3 sm:p-5">
              <div className="mr-3 sm:mr-4 bg-green-500/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5 sm:mb-1 opacity-70">Earnings</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground truncate tracking-tight">{format(artistStats.monthlyEarnings)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden border-border/40 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300 group bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl">
          <CardContent className="flex items-center p-3 sm:p-5">
            <div className="mr-3 sm:mr-4 bg-blue-500/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5 sm:mb-1 opacity-70">Artworks</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground truncate tracking-tight">{artistStats.totalArtworks}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/40 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300 group bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl">
          <CardContent className="flex items-center p-3 sm:p-5">
            <div className="mr-3 sm:mr-4 bg-amber-500/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5 sm:mb-1 opacity-70">Followers</p>
              <button
                className="text-lg sm:text-2xl font-bold text-primary cursor-pointer hover:underline underline-offset-4 decoration-2 truncate tracking-tight min-h-[44px] flex items-center"
                onClick={() => setOpenFollowers(true)}
              >
                {artistStats.followers}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={openFollowers} onOpenChange={setOpenFollowers}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg sm:text-xl font-bold">Followers</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <FollowersList />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardHeader;
