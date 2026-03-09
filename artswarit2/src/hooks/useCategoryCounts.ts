import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CategoryCount {
  category: string;
  count: number;
}

export const useCategoryCounts = () => {
  const [categoryCounts, setCategoryCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    try {
      // Fetch all approved artists from profiles
      const { data: profiles, error } = await supabase
        .from('public_profiles')
        .select('role, tags')
        .eq('role', 'artist')
        .eq('account_status', 'approved');

      if (error) {
        console.error('Error fetching category counts:', error);
        return;
      }

      const counts = new Map<string, number>();
      
      // Category mapping from tags to display names
      const categoryMappings: Record<string, string> = {
        'musician': 'Musicians',
        'music': 'Musicians',
        'writer': 'Writers',
        'writing': 'Writers',
        'rapper': 'Rappers',
        'rap': 'Rappers',
        'editor': 'Editors',
        'editing': 'Editors',
        'photographer': 'Photographers',
        'photography': 'Photographers',
        'illustrator': 'Illustrators',
        'illustration': 'Illustrators',
        'voice artist': 'Voice Artists',
        'voice': 'Voice Artists',
        'voiceover': 'Voice Artists',
        'animator': 'Animators',
        'animation': 'Animators',
        'scriptwriter': 'Scriptwriters',
        'scriptwriting': 'Scriptwriters',
      };

      profiles?.forEach(profile => {
        const tags = profile.tags || [];
        const processedCategories = new Set<string>();
        
        tags.forEach((tag: string) => {
          const normalizedTag = tag.toLowerCase().trim();
          const category = categoryMappings[normalizedTag];
          
          if (category && !processedCategories.has(category)) {
            processedCategories.add(category);
            counts.set(category, (counts.get(category) || 0) + 1);
          }
        });
      });

      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error in fetchCounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();

    // Subscribe to real-time profile changes
    const channel = supabase
      .channel('category-counts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          console.log('Profiles updated, refreshing category counts...');
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getCount = (categoryTitle: string): number => {
    return categoryCounts.get(categoryTitle) || 0;
  };

  return { categoryCounts, getCount, loading, refetch: fetchCounts };
};
