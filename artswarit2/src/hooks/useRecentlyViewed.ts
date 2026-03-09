import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RecentlyViewedItem {
  id: string;
  item_type: 'artwork' | 'artist';
  item_id: string;
  viewed_at: string;
  // Populated data
  title?: string;
  imageUrl?: string;
  name?: string;
  avatarUrl?: string;
}

const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const { user } = useAuth();
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recently viewed items
  const fetchItems = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recently_viewed')
        .select('*')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(MAX_ITEMS);

      if (error) throw error;

      // Enrich with actual data
      const enrichedItems: RecentlyViewedItem[] = [];

      for (const item of data || []) {
        const itemType = item.item_type as 'artwork' | 'artist';
        
        if (itemType === 'artwork') {
          const { data: artwork } = await supabase
            .from('artworks')
            .select('title, media_url')
            .eq('id', item.item_id)
            .maybeSingle();

          if (artwork) {
            enrichedItems.push({
              id: item.id,
              item_type: itemType,
              item_id: item.item_id,
              viewed_at: item.viewed_at || '',
              title: artwork.title,
              imageUrl: artwork.media_url,
            });
          }
        } else if (itemType === 'artist') {
          const { data: artist } = await supabase
            .from('public_profiles')
            .select('full_name, avatar_url')
            .eq('id', item.item_id)
            .maybeSingle();

          if (artist) {
            enrichedItems.push({
              id: item.id,
              item_type: itemType,
              item_id: item.item_id,
              viewed_at: item.viewed_at || '',
              name: artist.full_name,
              avatarUrl: artist.avatar_url,
            });
          }
        }
      }

      setItems(enrichedItems);
    } catch (err) {
      console.error('Error fetching recently viewed:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Track a view
  const trackView = useCallback(async (itemType: 'artwork' | 'artist', itemId: string) => {
    if (!user?.id) return;

    try {
      // Upsert to update viewed_at if exists, or insert new
      const { error } = await supabase
        .from('recently_viewed')
        .upsert(
          {
            user_id: user.id,
            item_type: itemType,
            item_id: itemId,
            viewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,item_type,item_id',
          }
        );

      if (error) throw error;

      // Refresh the list
      fetchItems();
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  }, [user?.id, fetchItems]);

  // Clear all recently viewed
  const clearAll = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('recently_viewed')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
    } catch (err) {
      console.error('Error clearing recently viewed:', err);
    }
  }, [user?.id]);

  return {
    items,
    loading,
    trackView,
    clearAll,
    refresh: fetchItems,
  };
}
