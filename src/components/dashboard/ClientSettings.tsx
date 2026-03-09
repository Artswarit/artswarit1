import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Save, Shield, Bell, Eye, User, Camera, Loader2, 
  Globe, Clock, Trash2, Monitor, Smartphone,
  Mail, MessageSquare, FolderOpen, Lock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ChangeEmailForm from "@/components/settings/ChangeEmailForm";

interface LoginSession {
  id: string;
  device_info: string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
  is_current: boolean;
  created_at: string;
  last_active_at: string | null;
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'ar', label: 'العربية' },
  { value: 'hi', label: 'हिन्दी' },
];

const ClientSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    showActivityStats: true,
    showLastActive: true,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    projectUpdateNotifications: true,
    messageNotifications: true,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    timezone: 'UTC',
    language: 'en',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateProfileSetting = async (fields: Record<string, any>) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update failed", description: err.message });
    }
  };

  // Fetch profile and sessions on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      setLoadingSessions(true);
      
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) throw profileError;
        
        if (profileData) {
          setProfile(profileData);
          
          // Set privacy settings from DB columns
          setPrivacySettings({
            profileVisibility: profileData.profile_visibility ?? true,
            showActivityStats: profileData.show_activity_stats ?? true,
            showLastActive: profileData.show_last_active ?? true,
          });
          
          // Set notification settings from DB columns
          setNotificationSettings({
            emailNotifications: profileData.email_notifications ?? true,
            inAppNotifications: profileData.in_app_notifications ?? true,
            projectUpdateNotifications: profileData.project_update_notifications ?? true,
            messageNotifications: profileData.message_notifications ?? true,
          });
          
          // Set preferences from DB columns
          setPreferences({
            timezone: profileData.timezone || 'UTC',
            language: profileData.language || 'en',
          });
        }

        // Fetch login sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('login_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('last_active_at', { ascending: false });

        if (!sessionsError && sessionsData) {
          setSessions(sessionsData);
        }
      } catch (error: any) {
        // Silent fail for background fetch
      } finally {
        setLoading(false);
        setLoadingSessions(false);
      }
    };
    
    fetchData();
  }, [user?.id]);

  // Real-time subscription for profile updates
  useEffect(() => {
    if (!user?.id) return;

    let timeoutId: NodeJS.Timeout;

    const refetchProfile = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (error) throw error;
        
        if (data) {
          setProfile(data);
          setPrivacySettings({
            profileVisibility: data.profile_visibility ?? true,
            showActivityStats: data.show_activity_stats ?? true,
            showLastActive: data.show_last_active ?? true,
          });
          setNotificationSettings({
            emailNotifications: data.email_notifications ?? true,
            inAppNotifications: data.in_app_notifications ?? true,
            projectUpdateNotifications: data.project_update_notifications ?? true,
            messageNotifications: data.message_notifications ?? true,
          });
          setPreferences({
            timezone: data.timezone || 'UTC',
            language: data.language || 'en',
          });
          // NOTE: No toast here — realtime sync should be silent
        }
      } catch (error) {
        // Silent — background sync
      }
    };

    const debouncedRefetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(refetchProfile, 500);
    };

    const channel = supabase
      .channel(`client-settings-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => debouncedRefetch()
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Connected
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Realtime channel error");
          toast({
            variant: "destructive",
            title: "Sync Error",
            description: "Failed to connect to real-time updates.",
          });
        }
      });

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const refetchSessions = async () => {
      const { data, error } = await supabase
        .from('login_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active_at', { ascending: false });

      if (!error && data) {
        setSessions(data);
      }
    };

    const channel = supabase
      .channel(`client-settings-sessions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'login_sessions',
          filter: `user_id=eq.${user.id}`
        },
        () => refetchSessions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const saveSettings = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          // Privacy settings
          profile_visibility: privacySettings.profileVisibility,
          show_activity_stats: privacySettings.showActivityStats,
          show_last_active: privacySettings.showLastActive,
          // Notification settings
          email_notifications: notificationSettings.emailNotifications,
          in_app_notifications: notificationSettings.inAppNotifications,
          project_update_notifications: notificationSettings.projectUpdateNotifications,
          message_notifications: notificationSettings.messageNotifications,
          // Preferences
          timezone: preferences.timezone,
          language: preferences.language,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({ title: "Settings saved successfully!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({ variant: "destructive", title: "Password must be at least 6 characters" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      
      toast({ title: "Password updated successfully!" });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('login_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({ title: "Session terminated successfully!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const deleteAccount = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user?.id) return;

    setDeleting(true);
    try {
      await Promise.all([
        supabase.from('notifications').delete().eq('user_id', user.id),
        supabase.from('login_sessions').delete().eq('user_id', user.id),
        supabase.from('projects').delete().or(`artist_id.eq.${user.id},client_id.eq.${user.id}`),
        supabase.from('profiles').delete().eq('id', user.id),
        supabase.from('users').delete().eq('id', user.id),
      ]);

      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      setShowDeleteDialog(false);
      // Use signOut + navigate instead of window.location.href to keep auth state clean
      setTimeout(async () => {
        await signOut();
        navigate('/');
      }, 1500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: error.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev: any) => ({ ...prev, avatar_url: urlData.publicUrl }));
      toast({ title: "Avatar updated!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceInfo: string | null, os: string | null) => {
    const info = (deviceInfo || os || '').toLowerCase();
    if (info.includes('mobile') || info.includes('android') || info.includes('iphone')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-primary/5 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Settings</h2>
          <p className="text-sm font-medium text-muted-foreground/80 mt-1">Manage your account preferences and privacy</p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving} 
          className="w-full sm:w-auto bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-xl h-12 px-6 font-bold transition-all active:scale-95"
        >
          {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Profile Overview */}
        <Card className="rounded-[2rem] border-primary/10 shadow-xl backdrop-blur-md bg-background/95 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
          <CardHeader className="pb-6 sm:pb-8 bg-primary/5 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">
                  Profile Overview
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground/80 mt-1">
                  Your account at a glance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 sm:pt-8">
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="relative group">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl sm:text-3xl font-black bg-primary/10 text-primary">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg active:scale-90 group-hover:scale-110">
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={loading}
                  />
                </label>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-black text-lg sm:text-xl text-foreground">{profile?.full_name || 'Your Name'}</p>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">{user?.email}</p>
                <div className="flex mt-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold px-3 py-1 rounded-lg">Client Account</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="rounded-[2rem] border-primary/10 shadow-xl backdrop-blur-md bg-background/95 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
          <CardHeader className="pb-6 sm:pb-8 bg-primary/5 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">
                  Preferences
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground/80 mt-1">
                  Timezone and language settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 sm:pt-8">
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm font-bold ml-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Timezone
              </Label>
              <Select 
                value={preferences.timezone} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger className="h-12 sm:h-14 bg-muted/50 border-none focus:ring-primary/20 rounded-2xl px-6 font-medium text-base">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] rounded-2xl border-primary/10 shadow-2xl">
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value} className="min-h-[48px] rounded-xl focus:bg-primary/5">
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-bold ml-1 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Language
              </Label>
              <Select 
                value={preferences.language} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="h-12 sm:h-14 bg-muted/50 border-none focus:ring-primary/20 rounded-2xl px-6 font-medium text-base">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-primary/10 shadow-2xl">
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value} className="min-h-[48px] rounded-xl focus:bg-primary/5">
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Visibility */}
        <Card className="rounded-[2rem] border-primary/10 shadow-xl backdrop-blur-md bg-background/95 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
          <CardHeader className="pb-6 sm:pb-8 bg-primary/5 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">
                  Privacy & Visibility
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground/80 mt-1">
                  Control what others can see
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 sm:pt-8">
            <div className="flex items-center justify-between group min-h-[56px] p-4 rounded-2xl hover:bg-primary/5 transition-colors">
              <div className="flex-1 space-y-1">
                <Label htmlFor="profile-visibility" className="text-base sm:text-lg font-bold cursor-pointer">Public Profile</Label>
                <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">Make your profile visible to artists</p>
              </div>
              <Switch
                id="profile-visibility"
                checked={privacySettings.profileVisibility}
                onCheckedChange={async (checked) => {
                  setPrivacySettings(prev => ({ ...prev, profileVisibility: checked }));
                  await updateProfileSetting({ profile_visibility: checked });
                }}
                className="data-[state=checked]:bg-primary h-7 w-12"
              />
            </div>
            
            <div className="flex items-center justify-between group min-h-[56px] p-4 rounded-2xl hover:bg-primary/5 transition-colors">
              <div className="flex-1 space-y-1">
                <Label htmlFor="show-activity" className="text-base sm:text-lg font-bold cursor-pointer">Show Activity Stats</Label>
                <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">Display project stats to artists</p>
              </div>
              <Switch
                id="show-activity"
                checked={privacySettings.showActivityStats}
                onCheckedChange={async (checked) => {
                  setPrivacySettings(prev => ({ ...prev, showActivityStats: checked }));
                  await updateProfileSetting({ show_activity_stats: checked });
                }}
                className="data-[state=checked]:bg-primary h-7 w-12"
              />
            </div>
            
            <div className="flex items-center justify-between group min-h-[56px] p-4 rounded-2xl hover:bg-primary/5 transition-colors">
              <div className="flex-1 space-y-1">
                <Label htmlFor="show-last-active" className="text-base sm:text-lg font-bold cursor-pointer">Show Last Active</Label>
                <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">Display when you were last online</p>
              </div>
              <Switch
                id="show-last-active"
                checked={privacySettings.showLastActive}
                onCheckedChange={async (checked) => {
                  setPrivacySettings(prev => ({ ...prev, showLastActive: checked }));
                  await updateProfileSetting({ show_last_active: checked });
                }}
                className="data-[state=checked]:bg-primary h-7 w-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-[2rem] border-primary/10 shadow-xl backdrop-blur-md bg-background/95 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
          <CardHeader className="pb-6 sm:pb-8 bg-primary/5 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">
                  Notifications
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground/80 mt-1">
                  Choose how you want to be notified
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 sm:pt-8">
            <div className="flex items-center justify-between group min-h-[56px] p-4 rounded-2xl hover:bg-primary/5 transition-colors">
              <div className="flex-1 space-y-1">
                <Label htmlFor="email-notifications" className="text-base sm:text-lg font-bold cursor-pointer flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Notifications
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">Receive updates via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                className="data-[state=checked]:bg-primary h-7 w-12"
              />
            </div>
            
            <div className="flex items-center justify-between group min-h-[56px] p-4 rounded-2xl hover:bg-primary/5 transition-colors">
              <div className="flex-1 space-y-1">
                <Label htmlFor="in-app-notifications" className="text-base sm:text-lg font-bold cursor-pointer flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  In-App Notifications
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">Show notifications in the app</p>
              </div>
              <Switch
                id="in-app-notifications"
                checked={notificationSettings.inAppNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, inAppNotifications: checked }))}
                className="data-[state=checked]:bg-primary h-7 w-12"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="project-notifications" className="text-sm flex items-center gap-2">
                  <FolderOpen className="w-3 h-3" />
                  Project Updates
                </Label>
                <p className="text-xs text-muted-foreground">Notify when projects change</p>
              </div>
              <Switch
                id="project-notifications"
                checked={notificationSettings.projectUpdateNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, projectUpdateNotifications: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="message-notifications" className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" />
                  Message Alerts
                </Label>
                <p className="text-xs text-muted-foreground">Notify for new messages</p>
              </div>
              <Switch
                id="message-notifications"
                checked={notificationSettings.messageNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, messageNotifications: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Change */}
        <ChangeEmailForm />

        {/* Security - Password */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              Change Password
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-xs sm:text-sm flex items-center gap-2">
                <Lock className="w-3 h-3" />
                New Password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="mt-1 h-12 bg-muted/50 border-none focus-visible:ring-primary/20 rounded-2xl px-6 font-medium min-h-[48px]"
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="mt-1 h-12 bg-muted/50 border-none focus-visible:ring-primary/20 rounded-2xl px-6 font-medium min-h-[48px]"
                placeholder="Confirm new password"
              />
            </div>
            
            <Button 
              onClick={changePassword} 
              disabled={saving || !passwordData.newPassword}
              className="w-full"
              variant="outline"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Update Password
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-destructive/20 bg-destructive/5 shadow-xl backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-destructive/30">
          <CardHeader className="pb-6 sm:pb-8 bg-destructive/10 border-b border-destructive/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-destructive/20 text-destructive">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-black tracking-tight text-destructive">
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-sm font-medium text-destructive/70 mt-1">
                  Permanently delete your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <Button 
              variant="destructive" 
              className="w-full h-12 sm:h-14 font-black text-lg rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-destructive/20 min-h-[48px]"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Login Sessions */}
        <Card className="transition-all duration-300 hover:shadow-md lg:col-span-2">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage your login sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No active sessions found</p>
                <p className="text-xs mt-1">Sessions will appear here when you log in from different devices</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div 
                      key={session.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        session.is_current ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${session.is_current ? 'bg-primary/10' : 'bg-muted'}`}>
                          {getDeviceIcon(session.device_info, session.os)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {session.browser || session.device_info || 'Unknown Device'}
                            </p>
                            {session.is_current && (
                              <Badge variant="default" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {session.os && `${session.os} • `}
                            {session.location || 'Unknown location'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last active: {session.last_active_at 
                              ? formatDistanceToNow(new Date(session.last_active_at), { addSuffix: true })
                              : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      {!session.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => terminateSession(session.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your projects, messages, and profile data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={deleting} className="h-12 sm:h-10 min-h-[48px] sm:min-h-[40px] rounded-xl sm:rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteAccount} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-12 sm:h-10 min-h-[48px] sm:min-h-[40px] rounded-xl sm:rounded-md"
            >
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientSettings;
