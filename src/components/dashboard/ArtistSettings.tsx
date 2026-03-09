
import { useState, useEffect, useCallback } from "react";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { Shield, Bell, Eye, Globe, Loader2, Trash2, Mail, Crown, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ChangeEmailForm from "@/components/settings/ChangeEmailForm";
import AvailabilityCalendar from "@/components/dashboard/AvailabilityCalendar";
import { useArtistPlan } from "@/hooks/useArtistPlan";
import { FeatureLimitBanner } from "@/components/premium/FeatureLimitBanner";

interface ArtistSettingsProps {
  isLoading: boolean;
}

const ArtistSettings = ({ isLoading: propLoading }: ArtistSettingsProps) => {
  const { user, signOut } = useAuth();
  const { isProArtist, plan, loading: planLoading } = useArtistPlan(user?.id);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    profileVisibility: true,
    showEarnings: false,
    allowDirectMessages: true,
    autoAcceptProjects: false,
    twoFactorAuth: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch profile and settings on mount
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching settings",
        description: error.message
      });
      return;
    }
    
    if (data) {
      setProfile(data);
      // Load settings from profile social_links or metadata
      const savedSettings = (data.social_links as any)?.settings || {};
      setSettings(prev => {
        // Only update if values are different to avoid unnecessary re-renders
        if (JSON.stringify(prev) === JSON.stringify({ ...prev, ...savedSettings })) {
          return prev;
        }
        return {
          ...prev,
          ...savedSettings
        };
      });
    } else {
      // No profile found
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Real-time subscription for profile updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`artist-settings-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          fetchProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchProfile]);

  // Cross-tab synchronization via localStorage
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'artswarit:settings') return;
      try {
        const payload = JSON.parse(e.newValue || '{}');
        if (payload.userId !== user?.id) return;
        setSettings(prev => ({ ...prev, [payload.key]: payload.value }));
      } catch { void 0; }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user?.id]);

  const handleSettingChange = async (key: string, value: boolean, e?: React.MouseEvent | React.ChangeEvent) => {
    // Prevent default to fix mobile refresh issue
    if (e && 'preventDefault' in e) {
      e.preventDefault();
      e.stopPropagation?.();
    }

    // Restriction: Auto-accept projects is for Pro artists only
    if (key === 'autoAcceptProjects' && !isProArtist && value === true) {
      toast({
        title: "Pro Feature",
        description: "Auto-accepting projects is available for Pro Artists only.",
        variant: "default"
      });
      return;
    }
    
    const newSettings = {
      ...settings,
      [key]: value
    };
    
    // Optimistic update
    setSettings(newSettings);

    // Auto-save to database
    if (!user?.id) return;
    try {
      const currentSocialLinks = (profile?.social_links as Record<string, unknown>) || {};
      const updatePayload: Record<string, unknown> = {
        social_links: {
          ...currentSocialLinks,
          settings: newSettings
        },
        updated_at: new Date().toISOString()
      };
      // Mirror only to existing top-level columns
      if (key === 'profileVisibility') updatePayload['profile_visibility'] = value;
      if (key === 'emailNotifications') updatePayload['email_notifications'] = value;

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (error) throw error;
      // Broadcast to other tabs immediately
      try {
        localStorage.setItem('artswarit:settings', JSON.stringify({ userId: user.id, key, value, ts: Date.now() }));
      } catch { void 0; }
      // Non-blocking logging
      try {
        await supabase.from('function_logs').insert({
          action_type: 'settings_change',
          function_name: 'ArtistSettings.handleSettingChange',
          component_name: 'ArtistSettings',
          user_id: user.id,
          success: true,
          input_data: { key, value },
        });
      } catch (logErr) {
        // Logging failed silently
      }
      
      toast({
        title: "Setting updated",
        description: `${key.replace(/([A-Z])/g, ' $1').trim()} has been ${value ? 'enabled' : 'disabled'}.`
      });
    } catch (error: any) {
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !value }));
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveSettings = async (e?: React.MouseEvent) => {
    // Prevent default to fix mobile refresh issue
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user?.id) return;

    setSaving(true);
    try {
      // Get current social_links and merge with settings
      const currentSocialLinks = (profile?.social_links as Record<string, unknown>) || {};
      
      const { error } = await supabase
        .from('profiles')
        .update({
          social_links: {
            ...currentSocialLinks,
            settings
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e?: React.MouseEvent) => {
    // Prevent default to fix mobile refresh issue
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please ensure both passwords are the same."
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters."
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully."
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (e?: React.MouseEvent) => {
    // Prevent default to fix mobile refresh issue
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user?.id) return;
    
    setDeleting(true);
    try {
      // Delete user data from tables
      await Promise.all([
        supabase.from('artworks').delete().eq('artist_id', user.id),
        supabase.from('projects').delete().or(`artist_id.eq.${user.id},client_id.eq.${user.id}`),
        supabase.from('notifications').delete().eq('user_id', user.id),
        supabase.from('profiles').delete().eq('id', user.id),
        supabase.from('users').delete().eq('id', user.id)
      ]);

      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted."
      });

      setShowDeleteDialog(false);
      setTimeout(() => {
        signOut();
        navigate('/');
      }, 1500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: error.message
      });
    } finally {
      setDeleting(false);
    }
  };

  if (propLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md" />
        <div className="h-64 bg-gray-200 animate-pulse rounded-md" />
        <div className="h-64 bg-gray-200 animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 max-w-7xl mx-auto px-2 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-primary/5 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Settings</h2>
          <p className="text-sm font-medium text-muted-foreground/80 mt-1">Manage your account, privacy and preferences</p>
        </div>
        {!isProArtist && !planLoading && (
          <Button 
            onClick={() => navigate('/artist-dashboard/premium')}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 rounded-xl h-12 px-6 font-bold transition-all active:scale-95"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        <div className="space-y-6 sm:space-y-10">
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
                    Manage your notification preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 pt-6 sm:pt-8">
              <div className="flex items-center justify-between group min-h-[56px] p-4 rounded-2xl hover:bg-primary/5 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications" className="text-base sm:text-lg font-bold cursor-pointer">Email Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">Receive updates via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  className="data-[state=checked]:bg-primary h-7 w-12"
                />
              </div>
              
              <div className="flex items-center justify-between group min-h-[56px] p-4 rounded-2xl hover:bg-primary/5 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="direct-messages" className="text-base sm:text-lg font-bold cursor-pointer">Direct Messages</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">Allow clients to message you directly</p>
                </div>
                <Switch
                  id="direct-messages"
                  checked={settings.allowDirectMessages}
                  onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
                  className="data-[state=checked]:bg-primary h-7 w-12"
                />
              </div>
              
              <div className="flex items-center justify-between group min-h-[56px] p-4 rounded-2xl hover:bg-primary/5 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="auto-accept" className="flex items-center gap-2 text-base sm:text-lg font-bold cursor-pointer">
                    Auto-accept Projects
                    {!isProArtist && <Crown className="h-4 w-4 text-yellow-500 shrink-0 animate-pulse" />}
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">Automatically accept project invitations</p>
                </div>
                <div className="flex items-center gap-4">
                  {!isProArtist && <Lock className="h-4 w-4 text-muted-foreground/60 shrink-0" />}
                  <Switch
                    id="auto-accept"
                    checked={settings.autoAcceptProjects}
                    onCheckedChange={(checked) => handleSettingChange('autoAcceptProjects', checked)}
                    disabled={!isProArtist}
                    className="data-[state=checked]:bg-primary h-7 w-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-primary/10 shadow-xl backdrop-blur-md bg-background/95 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
            <CardHeader className="pb-6 sm:pb-8 bg-primary/5 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">
                    Privacy
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground/80 mt-1">
                    Control your profile visibility and privacy
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 pt-6 sm:pt-8">
              <div className="flex items-center justify-between group min-h-[56px] p-4 rounded-2xl hover:bg-primary/5 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="profile-visibility" className="text-base sm:text-lg font-bold cursor-pointer">Public Profile</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">Make your profile visible to everyone</p>
                </div>
                <Switch
                  id="profile-visibility"
                  checked={settings.profileVisibility}
                  onCheckedChange={(checked) => handleSettingChange('profileVisibility', checked)}
                  className="data-[state=checked]:bg-primary h-7 w-12"
                />
              </div>
              
              
              
              <div className="flex items-center justify-between group min-h-[56px] p-4 rounded-2xl hover:bg-primary/5 transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="show-earnings" className="text-base sm:text-lg font-bold cursor-pointer">Show Earnings</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">Display your earnings publicly</p>
                </div>
                <Switch
                  id="show-earnings"
                  checked={settings.showEarnings}
                  onCheckedChange={(checked) => handleSettingChange('showEarnings', checked)}
                  className="data-[state=checked]:bg-primary h-7 w-12"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 sm:space-y-10">
          {/* Email Change */}
          <div className="rounded-[2rem] border-primary/10 shadow-xl backdrop-blur-md bg-background/95 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
            <ChangeEmailForm />
          </div>

          {/* Availability Calendar */}
          <div className="rounded-[2rem] border-primary/10 shadow-xl backdrop-blur-md bg-background/95 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
            <AvailabilityCalendar />
          </div>

          <Card className="rounded-[2rem] border-primary/10 shadow-xl backdrop-blur-md bg-background/95 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
            <CardHeader className="pb-6 sm:pb-8 bg-primary/5 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">
                    Security
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground/80 mt-1">
                    Update your account password
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 sm:pt-8">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-bold ml-1">New Password</Label>
                <Input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="h-12 sm:h-14 bg-muted/50 border-none focus-visible:ring-primary/20 rounded-2xl px-6 font-medium min-h-[48px]"
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-bold ml-1">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="h-12 sm:h-14 bg-muted/50 border-none focus-visible:ring-primary/20 rounded-2xl px-6 font-medium min-h-[48px]"
                  placeholder="Confirm new password"
                />
              </div>
              
              <Button 
                onClick={changePassword} 
                disabled={saving || !passwordData.newPassword} 
                className="w-full h-12 sm:h-14 font-black text-lg rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-primary/20 min-h-[48px] mt-2"
              >
                {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
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
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your artworks, projects, messages, and profile data will be permanently deleted.
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

export default ArtistSettings;
