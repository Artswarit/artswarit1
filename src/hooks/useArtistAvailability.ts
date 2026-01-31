import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export type AvailabilityStatus = 'available' | 'busy' | 'vacation';

interface AvailabilityEntry {
  id: string;
  date: string;
  status: AvailabilityStatus;
  note?: string;
}

export function useArtistAvailability(artistId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [isOnVacation, setIsOnVacation] = useState(false);
  const [loading, setLoading] = useState(true);

  const targetArtistId = artistId || user?.id;

  // Fetch availability for a date range
  const fetchAvailability = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!targetArtistId) {
      setAvailability([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('artist_availability')
        .select('*')
        .eq('artist_id', targetArtistId);

      if (startDate) {
        query = query.gte('date', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        query = query.lte('date', format(endDate, 'yyyy-MM-dd'));
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;

      setAvailability((data || []).map(d => ({
        id: d.id,
        date: d.date,
        status: d.status as AvailabilityStatus,
        note: d.note,
      })));

      // Also fetch vacation status from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_on_vacation')
        .eq('id', targetArtistId)
        .maybeSingle();

      setIsOnVacation(profile?.is_on_vacation || false);
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  }, [targetArtistId]);

  useEffect(() => {
    // Fetch current month by default
    const now = new Date();
    fetchAvailability(startOfMonth(now), endOfMonth(now));
  }, [fetchAvailability]);

  // Set availability for a specific date
  const setDateAvailability = useCallback(async (
    date: Date,
    status: AvailabilityStatus,
    note?: string
  ) => {
    if (!user?.id || user.id !== targetArtistId) {
      toast({
        title: "Permission denied",
        description: "You can only update your own availability.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const dateStr = format(date, 'yyyy-MM-dd');

      const { error } = await supabase
        .from('artist_availability')
        .upsert(
          {
            artist_id: user.id,
            date: dateStr,
            status,
            note,
          },
          {
            onConflict: 'artist_id,date',
          }
        );

      if (error) throw error;

      // Update local state
      setAvailability(prev => {
        const existing = prev.findIndex(a => a.date === dateStr);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], status, note };
          return updated;
        } else {
          return [...prev, { id: '', date: dateStr, status, note }];
        }
      });

      toast({
        title: "Availability updated",
        description: `${format(date, 'MMM d, yyyy')} set to ${status}.`,
      });

      return true;
    } catch (err) {
      console.error('Error setting availability:', err);
      toast({
        title: "Error",
        description: "Failed to update availability.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, targetArtistId, toast]);

  // Toggle vacation mode
  const toggleVacationMode = useCallback(async () => {
    if (!user?.id || user.id !== targetArtistId) {
      return false;
    }

    try {
      const newVacationStatus = !isOnVacation;

      const { error } = await supabase
        .from('profiles')
        .update({ is_on_vacation: newVacationStatus })
        .eq('id', user.id);

      if (error) throw error;

      setIsOnVacation(newVacationStatus);

      toast({
        title: newVacationStatus ? "Vacation mode enabled" : "Vacation mode disabled",
        description: newVacationStatus 
          ? "Clients will see that you're currently unavailable."
          : "You're now shown as available for new projects.",
      });

      return true;
    } catch (err) {
      console.error('Error toggling vacation mode:', err);
      toast({
        title: "Error",
        description: "Failed to update vacation mode.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, targetArtistId, isOnVacation, toast]);

  // Get status for a specific date
  const getDateStatus = useCallback((date: Date): AvailabilityStatus => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = availability.find(a => a.date === dateStr);
    return entry?.status || 'available';
  }, [availability]);

  // Clear availability for a date
  const clearDateAvailability = useCallback(async (date: Date) => {
    if (!user?.id || user.id !== targetArtistId) {
      return false;
    }

    try {
      const dateStr = format(date, 'yyyy-MM-dd');

      const { error } = await supabase
        .from('artist_availability')
        .delete()
        .eq('artist_id', user.id)
        .eq('date', dateStr);

      if (error) throw error;

      setAvailability(prev => prev.filter(a => a.date !== dateStr));

      toast({
        title: "Availability cleared",
        description: `${format(date, 'MMM d, yyyy')} is now available.`,
      });

      return true;
    } catch (err) {
      console.error('Error clearing availability:', err);
      return false;
    }
  }, [user?.id, targetArtistId, toast]);

  return {
    availability,
    isOnVacation,
    loading,
    fetchAvailability,
    setDateAvailability,
    toggleVacationMode,
    getDateStatus,
    clearDateAvailability,
    isOwner: user?.id === targetArtistId,
  };
}
