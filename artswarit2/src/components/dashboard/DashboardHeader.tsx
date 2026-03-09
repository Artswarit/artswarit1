import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

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

  useEffect(() => {
    if (!user?.id) return;

    let isActive = true;

    const fetchStats = async () => {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [artworksCountRes, followersCountRes, earningsRes, monthlyEarningsRes, artworksViewsRes] =
        await Promise.all([
          supabase
            .from("artworks")
            .select("id", { count: "exact", head: true })
            .eq("artist_id", user.id),
          supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("following_id", user.id),
          supabase
            .from("transactions")
            .select("amount")
            .eq("seller_id", user.id)
            .eq("status", "success"),
          supabase
            .from("transactions")
            .select("amount")
            .eq("seller_id", user.id)
            .eq("status", "success")
            .gte("created_at", monthStart.toISOString()),
          supabase.from("artworks").select("metadata").eq("artist_id", user.id),
        ]);

      if (
        artworksCountRes.error ||
        followersCountRes.error ||
        earningsRes.error ||
        monthlyEarningsRes.error ||
        artworksViewsRes.error
      ) {
        console.error("Error fetching dashboard stats", {
          artworks: artworksCountRes.error,
          follows: followersCountRes.error,
          earnings: earningsRes.error,
          monthly: monthlyEarningsRes.error,
          views: artworksViewsRes.error,
        });
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

      if (!isActive) return;

      setArtistStats({
        totalViews,
        monthlyEarnings,
        totalArtworks: artworksCountRes.count ?? 0,
        followers: followersCountRes.count ?? 0,
      });

      // (Optional) keep totalEarnings handy for later UI without refetching
      void totalEarnings;
    };

    fetchStats();

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
      isActive = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <div className="space-y-4 sm:space-y-6 py-3 sm:py-[18px] my-6 sm:my-[49px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="mr-3 sm:mr-4 bg-purple-100 p-2 rounded-full">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Views</p>
              <p className="text-xl sm:text-2xl font-bold">{artistStats.totalViews.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="mr-3 sm:mr-4 bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Monthly Earnings</p>
              <p className="text-xl sm:text-2xl font-bold">{format(artistStats.monthlyEarnings)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="mr-3 sm:mr-4 bg-blue-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Artworks</p>
              <p className="text-xl sm:text-2xl font-bold">{artistStats.totalArtworks}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="mr-3 sm:mr-4 bg-amber-100 p-2 rounded-full">
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
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Followers</p>
              <p className="text-xl sm:text-2xl font-bold">{artistStats.followers}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHeader;
