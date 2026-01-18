import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Plan configuration constants
export const PLANS = {
  starter: {
    name: "Starter",
    price: 0,
    platformFee: 0.15, // 15%
    portfolioLimit: 10,
    serviceLimit: 2,
    features: [
      "15% platform success fee per milestone",
      "Limited portfolio (10 items)",
      "Max 2 services",
      "Standard visibility",
      "Direct client chat included"
    ]
  },
  pro: {
    name: "Pro Artist",
    price: 499, // ₹499/month
    platformFee: 0, // 0%
    portfolioLimit: Infinity,
    serviceLimit: Infinity,
    features: [
      "0% platform fee (keep 100%)",
      "Unlimited portfolio",
      "Unlimited services",
      "Verified badge",
      "Priority ranking",
      "Featured rotation",
      "Trust-first experience"
    ]
  }
} as const;

export type PlanType = "starter" | "pro";

export interface ArtistPlanInfo {
  plan: PlanType;
  isProArtist: boolean;
  platformFee: number;
  portfolioLimit: number;
  serviceLimit: number;
  renewAt: string | null;
  startedAt: string | null;
}

export const useArtistPlan = (userId: string | undefined | null) => {
  const [planInfo, setPlanInfo] = useState<ArtistPlanInfo>({
    plan: "starter",
    isProArtist: false,
    platformFee: PLANS.starter.platformFee,
    portfolioLimit: PLANS.starter.portfolioLimit,
    serviceLimit: PLANS.starter.serviceLimit,
    renewAt: null,
    startedAt: null
  });
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    if (!userId) {
      setPlanInfo({
        plan: "starter",
        isProArtist: false,
        platformFee: PLANS.starter.platformFee,
        portfolioLimit: PLANS.starter.portfolioLimit,
        serviceLimit: PLANS.starter.serviceLimit,
        renewAt: null,
        startedAt: null
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && !error) {
      // User has active Pro subscription
      setPlanInfo({
        plan: "pro",
        isProArtist: true,
        platformFee: PLANS.pro.platformFee,
        portfolioLimit: PLANS.pro.portfolioLimit,
        serviceLimit: PLANS.pro.serviceLimit,
        renewAt: data.renew_at,
        startedAt: data.started_at
      });
    } else {
      // User is on Starter plan
      setPlanInfo({
        plan: "starter",
        isProArtist: false,
        platformFee: PLANS.starter.platformFee,
        portfolioLimit: PLANS.starter.portfolioLimit,
        serviceLimit: PLANS.starter.serviceLimit,
        renewAt: null,
        startedAt: null
      });
    }
    
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Real-time subscription to plan changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`artist-plan-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscribers',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Plan subscription update:', payload);
          fetchPlan();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchPlan]);

  return { ...planInfo, loading, refetch: fetchPlan };
};

// Utility function to calculate earnings
export const calculateEarnings = (amount: number, isProArtist: boolean) => {
  const feeRate = isProArtist ? PLANS.pro.platformFee : PLANS.starter.platformFee;
  const platformFee = Math.round(amount * feeRate * 100) / 100;
  const artistPayout = Math.round((amount - platformFee) * 100) / 100;
  
  return {
    total: amount,
    platformFee,
    artistPayout,
    feePercentage: feeRate * 100
  };
};
