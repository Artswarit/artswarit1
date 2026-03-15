import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSync } from "@/lib/realtime-sync";

export interface PremiumInfo {
  isActive: boolean;
  subscriptionTier: "monthly" | "yearly" | "lifetime" | null;
  renewAt: string | null;
  startedAt: string | null;
}

export const usePremiumSubscription = (userId: string | undefined | null) => {
  const [premium, setPremium] = useState<PremiumInfo>({
    isActive: false,
    subscriptionTier: null,
    renewAt: null,
    startedAt: null
  });
  const [loading, setLoading] = useState(true);

  const fetchPremium = useCallback(async () => {
    if (!userId) {
      setPremium({
        isActive: false,
        subscriptionTier: null,
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

    if (data) {
      setPremium({
        isActive: true,
        subscriptionTier: data.subscription_tier,
        renewAt: data.renew_at,
        startedAt: data.started_at
      });
    } else {
      setPremium({
        isActive: false,
        subscriptionTier: null,
        renewAt: null,
        startedAt: null
      });
    }
    setLoading(false);
  }, [userId]);

  // Realtime Sync
  useRealtimeSync('subscription', fetchPremium);

  useEffect(() => {
    fetchPremium();

    if (!userId) return;

    // Real-time subscription for premium changes
    const channel = supabase
      .channel(`premium-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscribers',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchPremium();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchPremium]);

  return { ...premium, loading };
};
