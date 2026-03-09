import { useEffect, useMemo, useState } from 'react';
import { useArtistAvailability, AvailabilityStatus } from '@/hooks/useArtistAvailability';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Plane, 
  Loader2, 
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
// using custom radio UI instead of RadioGroup to allow circle+check styling
// duplicate import removed

const STATUS_CONFIG: Record<AvailabilityStatus, { label: string; color: string; icon: React.ReactNode }> = {
  available: { 
    label: 'Available', 
    color: 'bg-green-500', 
    icon: <CheckCircle className="h-4 w-4 text-green-500" /> 
  },
  busy: { 
    label: 'Busy', 
    color: 'bg-amber-500', 
    icon: <Clock className="h-4 w-4 text-amber-500" /> 
  },
  vacation: { 
    label: 'Vacation', 
    color: 'bg-red-500', 
    icon: <XCircle className="h-4 w-4 text-red-500" /> 
  },
};

const AvailabilityCalendar = () => {
  const {
    availability,
    isOnVacation,
    loading,
    setDateAvailability,
    setMultiDateAvailability,
    toggleVacationMode,
    setVacationMode,
    getDateStatus,
    clearDateAvailability,
    isOwner,
    fetchAvailability,
  } = useArtistAvailability();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [pendingDates, setPendingDates] = useState<Date[]>([]);
  const [updating, setUpdating] = useState(false);
  const [selectedStatusOption, setSelectedStatusOption] = useState<AvailabilityStatus | undefined>(undefined);
  const [pendingStart, setPendingStart] = useState<Date | undefined>(undefined);
  const [pendingEnd, setPendingEnd] = useState<Date | undefined>(undefined);
  const storageKey = 'availability:selected';

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isOwner) {
      setSelectedDate(date);
    }
  };
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.status) setSelectedStatusOption(parsed.status as AvailabilityStatus);
        if (parsed.pendingStart) setPendingStart(new Date(parsed.pendingStart));
        if (parsed.pendingEnd) setPendingEnd(new Date(parsed.pendingEnd));
        if (parsed.pendingDates?.length) setPendingDates(parsed.pendingDates.map((d: string) => new Date(d)));
      }
    } catch { void 0; }
  }, []);
  useEffect(() => {
    try {
      const payload = {
        status: selectedStatusOption,
        pendingStart: pendingStart ? pendingStart.toISOString() : undefined,
        pendingEnd: pendingEnd ? pendingEnd.toISOString() : undefined,
        pendingDates: pendingDates.map(d => d.toISOString()),
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch { void 0; }
  }, [selectedStatusOption, pendingStart, pendingEnd, pendingDates]);
  const rangeDates = useMemo(() => {
    if (!pendingStart || !pendingEnd) return [];
    const a = new Date(pendingStart);
    const b = new Date(pendingEnd);
    const out: Date[] = [];
    const cur = new Date(a);
    while (cur <= b) {
      out.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [pendingStart, pendingEnd]);

  const handleSetStatus = async (status: AvailabilityStatus, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedDate || !isOwner) return;
    
    setUpdating(true);
    await setDateAvailability(selectedDate, status);
    setUpdating(false);
    setSelectedDate(undefined);
  };

  const handleClearDate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedDate || !isOwner) return;
    
    setUpdating(true);
    await clearDateAvailability(selectedDate);
    setUpdating(false);
    setSelectedDate(undefined);
  };

  const handleToggleVacation = async (checked?: boolean) => {
    // Enabling requires selection + date; disabling is immediate
    if (checked === true && isOwner) {
      if (!selectedStatusOption) {
        toast({ title: "Selection required", description: "Choose Busy or Vacation.", variant: "destructive" });
        return;
      }
      if (selectedStatusOption === 'vacation') {
        if (!pendingStart || !pendingEnd) {
          toast({ title: "Dates required", description: "Select start and end dates.", variant: "destructive" });
          return;
        }
        if (pendingEnd < pendingStart) {
          toast({ title: "Invalid range", description: "End date must be after start date.", variant: "destructive" });
          return;
        }
      } else {
        if (!selectedDate && !pendingStart) {
          toast({ title: "Date required", description: "Select a start date.", variant: "destructive" });
          return;
        }
      }
      setUpdating(true);
      let ok1 = false;
      if (selectedStatusOption === 'vacation') {
        ok1 = await setMultiDateAvailability(rangeDates, 'vacation');
      } else {
        const start = pendingStart || selectedDate!;
        if (pendingEnd && pendingEnd >= start) {
          const dates: Date[] = [];
          const cur = new Date(start);
          while (cur <= pendingEnd) {
            dates.push(new Date(cur));
            cur.setDate(cur.getDate() + 1);
          }
          ok1 = await setMultiDateAvailability(dates, 'busy');
        } else {
          ok1 = await setDateAvailability(start, 'busy');
        }
      }
      const ok2 = await setVacationMode(selectedStatusOption === 'vacation');
      setUpdating(false);
      if (ok1 && ok2 !== false) {
        toast({
          title: "Status enabled",
          description: `${selectedStatusOption === 'vacation' ? `${rangeDates.length} date(s)` : pendingEnd ? 'Multiple dates' : format((pendingStart || selectedDate)!, 'MMM d, yyyy')} set as ${STATUS_CONFIG[selectedStatusOption].label}.`,
        });
        // Force refresh for selected month and upcoming ranges
        const target = selectedStatusOption === 'vacation' ? pendingStart! : (pendingStart || selectedDate)!;
        await fetchAvailability(startOfMonth(target), endOfMonth(target));
        await fetchAvailability();
        window.dispatchEvent(new CustomEvent("focus-section", { detail: "availability-calendar" }));
        setPendingDates([]);
        setSelectedDate(undefined);
        // keep selection; user can change later
      }
      return;
    }
    // Turning OFF goes directly
    setUpdating(true);
    await setVacationMode(false);
    setUpdating(false);
  };

  // Ensure availability is an array before filtering to prevent crashes
  const safeAvailability = Array.isArray(availability) ? availability : [];

  // Custom day renderer to show availability status
  const modifiers = {
    busy: safeAvailability.filter(a => a.status === 'busy').map(a => new Date(a.date)),
    vacation: safeAvailability.filter(a => a.status === 'vacation').map(a => new Date(a.date)),
  };

  const modifiersStyles = {
    busy: { backgroundColor: 'hsl(var(--warning) / 0.2)', borderRadius: '50%' },
    vacation: { backgroundColor: 'hsl(var(--destructive) / 0.2)', borderRadius: '50%' },
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          <p className="text-xs sm:text-sm text-muted-foreground animate-pulse">Loading calendar...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="availability-calendar" className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-4 sm:pb-8 bg-muted/30 border-b border-border/40">
        <CardTitle className="flex items-center gap-3 text-fluid-base sm:text-2xl font-black tracking-tight text-foreground">
          <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl">
            <CalendarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
          </div>
          Availability Calendar
        </CardTitle>
        <CardDescription className="text-xs sm:text-base font-medium text-muted-foreground/80 mt-1 sm:mt-2">
          Manage your schedule and keep clients updated on your availability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-8 pt-5 sm:pt-8 p-4 sm:p-8">
        {/* Vacation Mode Toggle */}
        <div className="flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/40 bg-card/40 hover:bg-card/60 transition-all duration-300 group shadow-sm hover:shadow-md">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className={`p-2.5 sm:p-4 rounded-2xl transition-all duration-500 ${isOnVacation ? 'bg-red-500/10 dark:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-muted group-hover:bg-muted/80'}`}>
              <Plane className={`h-5 w-5 sm:h-7 sm:w-7 transition-transform duration-500 ${isOnVacation ? 'text-red-500 scale-110 rotate-12' : 'text-muted-foreground group-hover:scale-110'}`} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="vacation-mode" className="text-sm sm:text-xl font-black cursor-pointer tracking-tight group-hover:text-primary transition-colors">Vacation Mode</Label>
              <p className="text-[10px] sm:text-sm font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                {isOnVacation 
                  ? "Currently away" 
                  : "Available for booking"}
              </p>
            </div>
          </div>
          <Switch
            id="vacation-mode"
            checked={isOnVacation}
            onCheckedChange={handleToggleVacation}
            disabled={updating || !isOwner}
            className="data-[state=checked]:bg-red-500 scale-110 sm:scale-125 transition-transform"
          />
        </div>

        {/* Mandatory selection dialog removed; inline selection is used */}

        {/* Status Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 py-2.5 px-4 bg-muted/30 rounded-xl sm:rounded-2xl border border-border/20">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2 group cursor-default">
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${config.color} shadow-sm transition-transform group-hover:scale-125`} />
              <span className="text-[10px] sm:text-xs font-black text-muted-foreground/70 uppercase tracking-widest">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar */}
        {/* Inline selection (mandatory) */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center justify-around border rounded-lg p-3" role="radiogroup" aria-label="Select status">
            <button
              type="button"
              role="radio"
              aria-checked={selectedStatusOption === 'busy'}
              onClick={() => setSelectedStatusOption('busy')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary/5 transition-colors"
            >
              <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary">
                <svg
                  className={`w-3 h-3 text-primary transition-opacity ${selectedStatusOption === 'busy' ? 'opacity-100' : 'opacity-0'}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="text-sm font-medium">Busy</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={selectedStatusOption === 'vacation'}
              onClick={() => setSelectedStatusOption('vacation')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary/5 transition-colors"
            >
              <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary">
                <svg
                  className={`w-3 h-3 text-primary transition-opacity ${selectedStatusOption === 'vacation' ? 'opacity-100' : 'opacity-0'}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="text-sm font-medium">Vacation</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center p-2 sm:p-6 bg-background/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-border/40 shadow-inner group transition-all duration-500 hover:border-primary/20">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">
                {selectedStatusOption === 'vacation' ? 'Select Start and End' : 'Select Start (End optional)'}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Clear date selection"
                className="text-[10px] sm:text-xs hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setPendingStart(undefined);
                  setPendingEnd(undefined);
                  setSelectedDate(undefined);
                  setPendingDates([]);
                  toast({ title: "Cleared", description: "Date selection has been reset." });
                }}
              >
                Clear
              </Button>
            </div>
            <Calendar
              mode="range"
              selected={{ from: pendingStart, to: pendingEnd } as DateRange}
              onSelect={(range: DateRange | undefined) => {
                setPendingStart(range?.from || undefined);
                setPendingEnd(range?.to || undefined);
              }}
              showOutsideDays={false}
              className="rounded-xl p-0 sm:p-2 transition-all duration-300"
            />
            <p className="mt-2 text-[10px] sm:text-xs text-muted-foreground" aria-live="polite">
              {pendingStart && !pendingEnd && 'Choose end date to complete range'}
              {pendingStart && pendingEnd && format(pendingStart, 'MMM d, yyyy') + ' - ' + format(pendingEnd, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {pendingDates.length > 0 && (
            <Button
              variant="ghost"
              className="text-xs sm:text-sm"
              onClick={() => {
                setPendingDates([]);
                setPendingStart(undefined);
                setPendingEnd(undefined);
                setSelectedDate(undefined);
                toast({ title: "Cleared", description: "Pending dates and calendar selection cleared." });
              }}
            >
              Clear pending
            </Button>
          )}
        </div>
        {/* chips removed for a cleaner summary; range shown above calendar */}

        {/* Remove popover actions; enabling is done via toggle after selecting radio + date(s) */}

        {/* Upcoming Schedule section removed for a cleaner calendar UI */}
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
