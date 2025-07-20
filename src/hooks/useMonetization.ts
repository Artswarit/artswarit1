
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMonetization = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendTip = async (toUserId: string, amount: number, artworkId?: string, message?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('monetization', {
        body: {
          action: 'send_tip',
          data: {
            fromUserId: (await supabase.auth.getUser()).data.user?.id,
            toUserId,
            amount,
            artworkId,
            message
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Tip Sent!",
        description: `Successfully sent $${amount} tip`
      });

      return { error: null };
    } catch (error: any) {
      console.error('Send tip error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send tip",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (artistId: string, tier: string, amount: number) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('monetization', {
        body: {
          action: 'create_subscription',
          data: {
            userId: (await supabase.auth.getUser()).data.user?.id,
            artistId,
            tier,
            amount
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Subscribed!",
        description: `Successfully subscribed to ${tier} tier`
      });

      return { error: null };
    } catch (error: any) {
      console.error('Create subscription error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getEarnings = async (period: string = 'month') => {
    try {
      const { data, error } = await supabase.functions.invoke('monetization', {
        body: {
          action: 'get_earnings',
          data: {
            userId: (await supabase.auth.getUser()).data.user?.id,
            period
          }
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Get earnings error:', error);
      return { data: null, error };
    }
  };

  const withdrawFunds = async (amount: number, paymentMethod: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('monetization', {
        body: {
          action: 'withdraw_funds',
          data: {
            userId: (await supabase.auth.getUser()).data.user?.id,
            amount,
            paymentMethod
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted"
      });

      return { error: null };
    } catch (error: any) {
      console.error('Withdraw funds error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sendTip,
    createSubscription,
    getEarnings,
    withdrawFunds
  };
};
