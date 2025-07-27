import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Sale {
  id: string;
  artwork_id: string;
  artist_id: string;
  buyer_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  artwork?: {
    title: string;
    image_url: string;
  };
  buyer?: {
    full_name: string;
    email: string;
  };
}

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSales = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          artwork:artworks(title, image_url)
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const recordSale = async (artworkId: string, buyerId: string, amount: number) => {
    try {
      const { data, error } = await supabase
        .rpc('record_artwork_sale', {
          artwork_uuid: artworkId,
          buyer_uuid: buyerId,
          sale_amount: amount
        });

      if (error) throw error;

      toast({
        title: "Sale Recorded",
        description: `Sale of $${amount} has been recorded successfully`
      });

      await fetchSales();
      return data;
    } catch (error: any) {
      console.error('Error recording sale:', error);
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);

  // Real-time subscription for sales
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('sales_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
          filter: `artist_id=eq.${user.id}`
        },
        () => {
          fetchSales();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    sales,
    loading,
    recordSale,
    refetch: fetchSales
  };
};