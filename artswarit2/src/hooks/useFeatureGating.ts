import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useArtistPlan, PLANS } from "./useArtistPlan";

export interface FeatureLimits {
  portfolioCount: number;
  portfolioLimit: number;
  canUploadPortfolio: boolean;
  portfolioRemaining: number;
  
  serviceCount: number;
  serviceLimit: number;
  canAddService: boolean;
  servicesRemaining: number;
  
  isProArtist: boolean;
  showUpgradePrompt: boolean;
}

export const useFeatureGating = (userId: string | undefined | null) => {
  const { plan, isProArtist, portfolioLimit, serviceLimit, loading: planLoading } = useArtistPlan(userId);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch portfolio (artworks) count
      const { count: artworkCount } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .eq("artist_id", userId);

      // Fetch services count
      const { count: servicesCount } = await supabase
        .from("artist_services")
        .select("*", { count: "exact", head: true })
        .eq("artist_id", userId);

      setPortfolioCount(artworkCount || 0);
      setServiceCount(servicesCount || 0);
      setLoading(false);
    };

    fetchCounts();
  }, [userId]);

  // Real-time subscription to artwork and service changes
  useEffect(() => {
    if (!userId) return;

    const artworkChannel = supabase
      .channel(`portfolio-count-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks',
          filter: `artist_id=eq.${userId}`
        },
        async () => {
          const { count } = await supabase
            .from("artworks")
            .select("*", { count: "exact", head: true })
            .eq("artist_id", userId);
          setPortfolioCount(count || 0);
        }
      )
      .subscribe();

    const serviceChannel = supabase
      .channel(`service-count-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artist_services',
          filter: `artist_id=eq.${userId}`
        },
        async () => {
          const { count } = await supabase
            .from("artist_services")
            .select("*", { count: "exact", head: true })
            .eq("artist_id", userId);
          setServiceCount(count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(artworkChannel);
      supabase.removeChannel(serviceChannel);
    };
  }, [userId]);

  const canUploadPortfolio = isProArtist || portfolioCount < portfolioLimit;
  const canAddService = isProArtist || serviceCount < serviceLimit;
  const portfolioRemaining = isProArtist ? Infinity : Math.max(0, portfolioLimit - portfolioCount);
  const servicesRemaining = isProArtist ? Infinity : Math.max(0, serviceLimit - serviceCount);
  const showUpgradePrompt = !isProArtist && (portfolioCount >= portfolioLimit - 2 || serviceCount >= serviceLimit);

  const limits: FeatureLimits = {
    portfolioCount,
    portfolioLimit,
    canUploadPortfolio,
    portfolioRemaining,
    serviceCount,
    serviceLimit,
    canAddService,
    servicesRemaining,
    isProArtist,
    showUpgradePrompt
  };

  return {
    ...limits,
    loading: loading || planLoading,
    plan
  };
};
