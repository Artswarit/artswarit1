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
  const [nextVacationEnd, setNextVacationEnd] = useState<string | undefined>(undefined);
  const [nextVacationNote, setNextVacationNote] = useState<string | undefined>(undefined);
  const [nextVacationStart, setNextVacationStart] = useState<string | undefined>(undefined);
  const [nextBusyStart, setNextBusyStart] = useState<string | undefined>(undefined);
  const [nextBusyEnd, setNextBusyEnd] = useState<string | undefined>(undefined);
  const [nextBusyNote, setNextBusyNote] = useState<string | undefined>(undefined);
  const [lastVacationSetDate, setLastVacationSetDate] = useState<string | undefined>(undefined);
  const [lastBusySetDate, setLastBusySetDate] = useState<string | undefined>(undefined);

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

      // Upcoming vacation range (beyond current month)
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const { data: upcomingVac } = await supabase
        .from('artist_availability')
        .select('date,note')
        .eq('artist_id', targetArtistId)
        .eq('status', 'vacation')
        .gte('date', todayStr)
        .order('date', { ascending: true });
      if (upcomingVac && upcomingVac.length > 0) {
        setNextVacationStart(upcomingVac[0].date);
        setNextVacationEnd(upcomingVac[upcomingVac.length - 1].date);
        setNextVacationNote(upcomingVac[0].note || undefined);
      } else {
        setNextVacationStart(undefined);
        setNextVacationEnd(undefined);
        setNextVacationNote(undefined);
      }
      // Fallback: derive from current month availability if no upcoming found
      if (!upcomingVac || upcomingVac.length === 0) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const monthVac = (data || []).filter(d => d.status === 'vacation' && d.date >= today);
        if (monthVac.length > 0) {
          setNextVacationStart(monthVac[0].date);
          setNextVacationEnd(monthVac[monthVac.length - 1].date);
          setNextVacationNote(monthVac[0].note || undefined);
        }
      }
      // Last set date (<= today)
      const vacPast = (data || []).filter(d => d.status === 'vacation' && d.date <= todayStr);
      if (vacPast.length > 0) {
        const latest = vacPast.sort((a, b) => (a.date > b.date ? 1 : -1))[vacPast.length - 1];
        setLastVacationSetDate(latest.date);
      } else {
        setLastVacationSetDate(undefined);
      }
      
      const { data: upcomingBusy } = await supabase
        .from('artist_availability')
        .select('date,note')
        .eq('artist_id', targetArtistId)
        .eq('status', 'busy')
        .gte('date', todayStr)
        .order('date', { ascending: true });
      if (upcomingBusy && upcomingBusy.length > 0) {
        setNextBusyStart(upcomingBusy[0].date);
        setNextBusyEnd(upcomingBusy[upcomingBusy.length - 1].date);
        setNextBusyNote(upcomingBusy[0].note || undefined);
      } else {
        setNextBusyStart(undefined);
        setNextBusyEnd(undefined);
        setNextBusyNote(undefined);
      }
      // Fallback: derive from current month availability if no upcoming found
      if (!upcomingBusy || upcomingBusy.length === 0) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const monthBusy = (data || []).filter(d => d.status === 'busy' && d.date >= today);
        if (monthBusy.length > 0) {
          setNextBusyStart(monthBusy[0].date);
          setNextBusyEnd(monthBusy[monthBusy.length - 1].date);
          setNextBusyNote(monthBusy[0].note || undefined);
        }
      }
      // Last set busy date (<= today)
      const busyPast = (data || []).filter(d => d.status === 'busy' && d.date <= todayStr);
      if (busyPast.length > 0) {
        const latestBusy = busyPast.sort((a, b) => (a.date > b.date ? 1 : -1))[busyPast.length - 1];
        setLastBusySetDate(latestBusy.date);
      } else {
        setLastBusySetDate(undefined);
      }
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

    if (!targetArtistId) return;

    // Real-time subscription for availability changes
    const channel = supabase
      .channel(`artist-availability-${targetArtistId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artist_availability',
          filter: `artist_id=eq.${targetArtistId}`
        },
        () => {
          const currentNow = new Date();
          fetchAvailability(startOfMonth(currentNow), endOfMonth(currentNow));
          // Also refresh upcoming vacation range
          fetchAvailability(); // light call to reuse above logic; dates omitted refreshes profile + upcoming
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${targetArtistId}`
        },
        (payload) => {
          if (payload.new && 'is_on_vacation' in payload.new) {
            setIsOnVacation(payload.new.is_on_vacation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAvailability, targetArtistId]);

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

  // Explicitly set vacation mode
  const setVacationMode = useCallback(async (enabled: boolean) => {
    if (!user?.id || user.id !== targetArtistId) {
      return false;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_on_vacation: enabled })
        .eq('id', user.id);
      if (error) throw error;
      setIsOnVacation(enabled);
      toast({
        title: enabled ? "Vacation mode enabled" : "Vacation mode disabled",
        description: enabled 
          ? "Clients will see that you're currently unavailable."
          : "You're now shown as available for new projects.",
      });
      return true;
    } catch (err) {
      console.error('Error setting vacation mode:', err);
      toast({
        title: "Error",
        description: "Failed to update vacation mode.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, targetArtistId, toast]);

  const setMultiDateAvailability = useCallback(async (
    dates: Date[],
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
      const payload = dates.map(d => ({
        artist_id: user.id,
        date: format(d, 'yyyy-MM-dd'),
        status,
        note,
      }));
      const { error } = await supabase
        .from('artist_availability')
        .upsert(payload, { onConflict: 'artist_id,date' });
      if (error) throw error;
      setAvailability(prev => {
        const byDate = new Map<string, AvailabilityEntry>();
        prev.forEach(a => byDate.set(a.date, a));
        payload.forEach(p => byDate.set(p.date, {
          id: byDate.get(p.date)?.id || '',
          date: p.date,
          status,
          note,
        }));
        return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
      });
      toast({
        title: "Availability updated",
        description: `${payload.length} date(s) set to ${status}.`,
      });
      return true;
    } catch (err) {
      console.error('Error setting multiple dates:', err);
      toast({
        title: "Error",
        description: "Failed to update availability.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, targetArtistId, toast]);

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
    nextVacationStart,
    nextVacationEnd,
    nextVacationNote,
    nextBusyStart,
    nextBusyEnd,
    nextBusyNote,
    lastVacationSetDate,
    lastBusySetDate,
    loading,
    fetchAvailability,
    setDateAvailability,
     setMultiDateAvailability,
    toggleVacationMode,
    setVacationMode,
    getDateStatus,
    clearDateAvailability,
    isOwner: user?.id === targetArtistId,
  };
}
