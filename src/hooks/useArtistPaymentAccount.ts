import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RazorpayAccount {
  id: string;
  user_id: string;
  razorpay_account_id: string | null;
  account_status: string;
  kyc_status: string;
  payouts_enabled: boolean;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc_code: string | null;
  bank_swift_code: string | null;
  bank_iban: string | null;
  phone: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateAccountData {
  name: string;
  phone: string;
  country: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc_code?: string;
  bank_swift_code?: string;
  bank_iban?: string;
}

export function useArtistPaymentAccount() {
  const { user } = useAuth();
  const [account, setAccount] = useState<RazorpayAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchAccount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('razorpay_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching account:', error);
      }

      setAccount(data as RazorpayAccount | null);
    } catch (error) {
      console.error('Error fetching account:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAccount();

    // Subscribe to realtime updates
    if (user?.id) {
      const channel = supabase
        .channel(`razorpay-account-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'razorpay_accounts',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          console.log('Account update:', payload);
          if (payload.new) {
            setAccount(payload.new as RazorpayAccount);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, fetchAccount]);

  const createAccount = useCallback(async (data: CreateAccountData) => {
    setCreating(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('create-artist-razorpay-account', {
        body: data,
      });

      if (error) {
        throw new Error(error.message || 'Failed to create payment account');
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to create payment account');
      }

      toast.success('Payment account created successfully!');
      await fetchAccount();
      return true;
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Failed to create payment account');
      return false;
    } finally {
      setCreating(false);
    }
  }, [fetchAccount]);

  return {
    account,
    loading,
    creating,
    createAccount,
    isPayoutsEnabled: account?.payouts_enabled ?? false,
    kycStatus: account?.kyc_status ?? 'not_started',
    refetch: fetchAccount,
  };
}
