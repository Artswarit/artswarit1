import { useState } from 'react';
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
import { format, isSameDay } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
    toggleVacationMode,
    getDateStatus,
    clearDateAvailability,
    isOwner,
  } = useArtistAvailability();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [updating, setUpdating] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isOwner) {
      setSelectedDate(date);
    }
  };

  const handleSetStatus = async (status: AvailabilityStatus) => {
    if (!selectedDate || !isOwner) return;
    
    setUpdating(true);
    await setDateAvailability(selectedDate, status);
    setUpdating(false);
    setSelectedDate(undefined);
  };

  const handleClearDate = async () => {
    if (!selectedDate || !isOwner) return;
    
    setUpdating(true);
    await clearDateAvailability(selectedDate);
    setUpdating(false);
    setSelectedDate(undefined);
  };

  const handleToggleVacation = async () => {
    setUpdating(true);
    await toggleVacationMode();
    setUpdating(false);
  };

  // Custom day renderer to show availability status
  const modifiers = {
    busy: availability.filter(a => a.status === 'busy').map(a => new Date(a.date)),
    vacation: availability.filter(a => a.status === 'vacation').map(a => new Date(a.date)),
  };

  const modifiersStyles = {
    busy: { backgroundColor: 'hsl(var(--warning) / 0.2)', borderRadius: '50%' },
    vacation: { backgroundColor: 'hsl(var(--destructive) / 0.2)', borderRadius: '50%' },
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Availability Calendar
        </CardTitle>
        <CardDescription>
          Set your availability to let clients know when you're open for new projects.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vacation Mode Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isOnVacation ? 'bg-red-100 dark:bg-red-950' : 'bg-muted'}`}>
              <Plane className={`h-5 w-5 ${isOnVacation ? 'text-red-600' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <Label htmlFor="vacation-mode" className="font-medium">Vacation Mode</Label>
              <p className="text-sm text-muted-foreground">
                {isOnVacation 
                  ? "You're shown as unavailable for new projects" 
                  : "Enable to show you're on vacation"}
              </p>
            </div>
          </div>
          <Switch
            id="vacation-mode"
            checked={isOnVacation}
            onCheckedChange={handleToggleVacation}
            disabled={updating || !isOwner}
          />
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <span className="text-sm text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-lg border"
          />
        </div>

        {/* Selected Date Actions */}
        {selectedDate && isOwner && (
          <Popover open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(undefined)}>
            <PopoverTrigger asChild>
              <div />
            </PopoverTrigger>
            <PopoverContent className="w-64" align="center">
              <div className="space-y-3">
                <p className="font-medium text-sm">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Current: {STATUS_CONFIG[getDateStatus(selectedDate)].label}
                </p>
                <div className="flex flex-col gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2"
                      onClick={() => handleSetStatus(status as AvailabilityStatus)}
                      disabled={updating}
                    >
                      {config.icon}
                      Set as {config.label}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDate}
                    disabled={updating}
                  >
                    Reset to Available
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Upcoming Unavailable Dates */}
        {availability.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Upcoming Unavailable Dates</h4>
            <div className="flex flex-wrap gap-2">
              {availability
                .filter(a => a.status !== 'available' && new Date(a.date) >= new Date())
                .slice(0, 5)
                .map((entry) => (
                  <Badge 
                    key={entry.id} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {STATUS_CONFIG[entry.status].icon}
                    {format(new Date(entry.date), 'MMM d')}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
