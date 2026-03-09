
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
import { Shield, Bell, Eye, Globe, Loader2, Download, UserX, Trash2, Mail, Key, Smartphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ChangeEmailForm from "@/components/settings/ChangeEmailForm";
import RecoveryOptions from "@/components/settings/RecoveryOptions";
import TwoFactorSetup from "@/components/settings/TwoFactorSetup";
import AvailabilityCalendar from "@/components/dashboard/AvailabilityCalendar";

interface ArtistSettingsProps {
  isLoading: boolean;
}

const ArtistSettings = ({ isLoading }: ArtistSettingsProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [downloadingData, setDownloadingData] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    profileVisibility: true,
    showEarnings: false,
    allowDirectMessages: true,
    autoAcceptProjects: false,
    twoFactorAuth: false
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
      console.error('Error fetching profile:', error);
      return;
    }
    
    if (data) {
      setProfile(data);
      // Load settings from profile social_links or metadata
      const savedSettings = (data.social_links as any)?.settings || {};
      setSettings(prev => ({
        ...prev,
        ...savedSettings
      }));
    }
  }, [user?.id]);

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
          event: 'UPDATE',
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

  const handleSettingChange = async (key: string, value: boolean, e?: React.MouseEvent | React.ChangeEvent) => {
    // Prevent default to fix mobile refresh issue
    if (e && 'preventDefault' in e) {
      e.preventDefault();
      e.stopPropagation?.();
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
      
      const { error } = await supabase
        .from('profiles')
        .update({
          social_links: {
            ...currentSocialLinks,
            settings: newSettings
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
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

  const downloadUserData = async (e?: React.MouseEvent) => {
    // Prevent default to fix mobile refresh issue
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user?.id) return;
    
    setDownloadingData(true);
    try {
      // Fetch all user data
      const [profileRes, artworksRes, projectsRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('artworks').select('*').eq('artist_id', user.id),
        supabase.from('projects').select('*').or(`artist_id.eq.${user.id},client_id.eq.${user.id}`),
        supabase.from('messages').select('*').eq('sender_id', user.id)
      ]);

      const userData = {
        exportDate: new Date().toISOString(),
        profile: profileRes.data,
        artworks: artworksRes.data || [],
        projects: projectsRes.data || [],
        messages: messagesRes.data || [],
        settings
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data downloaded",
        description: "Your data has been downloaded successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message
      });
    } finally {
      setDownloadingData(false);
    }
  };

  const deactivateAccount = async (e?: React.MouseEvent) => {
    // Prevent default to fix mobile refresh issue
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user?.id) return;
    
    setDeactivating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          account_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Account deactivated",
        description: "Your account has been deactivated. You will be logged out."
      });

      setShowDeactivateDialog(false);
      setTimeout(() => {
        signOut();
        navigate('/');
      }, 1500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deactivation failed",
        description: error.message
      });
    } finally {
      setDeactivating(false);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="direct-messages">Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">Allow clients to message you directly</p>
                </div>
                <Switch
                  id="direct-messages"
                  checked={settings.allowDirectMessages}
                  onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-accept">Auto-accept Projects</Label>
                  <p className="text-sm text-muted-foreground">Automatically accept project invitations</p>
                </div>
                <Switch
                  id="auto-accept"
                  checked={settings.autoAcceptProjects}
                  onCheckedChange={(checked) => handleSettingChange('autoAcceptProjects', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy
              </CardTitle>
              <CardDescription>Control your profile visibility and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-visibility">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to everyone</p>
                </div>
                <Switch
                  id="profile-visibility"
                  checked={settings.profileVisibility}
                  onCheckedChange={(checked) => handleSettingChange('profileVisibility', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-earnings">Show Earnings</Label>
                  <p className="text-sm text-muted-foreground">Display your earnings publicly</p>
                </div>
                <Switch
                  id="show-earnings"
                  checked={settings.showEarnings}
                  onCheckedChange={(checked) => handleSettingChange('showEarnings', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Email Change */}
          <ChangeEmailForm />

          {/* Two-Factor Authentication */}
          <TwoFactorSetup />

          {/* Recovery Options */}
          <RecoveryOptions />

          {/* Availability Calendar */}
          <AvailabilityCalendar />

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              
              <Button onClick={changePassword} disabled={saving || !passwordData.newPassword} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Account Actions
              </CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={downloadUserData}
                disabled={downloadingData}
              >
                {downloadingData ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download My Data
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowDeactivateDialog(true)}
              >
                <UserX className="h-4 w-4 mr-2" />
                Deactivate Account
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your account will be hidden and you will be logged out. You can reactivate it by contacting support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deactivateAccount} disabled={deactivating}>
              {deactivating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your artworks, projects, messages, and profile data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteAccount} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
