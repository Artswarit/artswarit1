
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Shield, Bell, Eye, User, Camera, Loader2 } from "lucide-react";

const ClientSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    location: "",
    website: "",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    profileVisibility: true,
    allowDirectMessages: true,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }
      
      if (data) {
        setProfile(data);
        setFormData({
          fullName: data.full_name || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
        });
        // Load settings from social_links
        const savedSettings = (data.social_links as any)?.settings || {};
        setSettings(prev => ({
          ...prev,
          ...savedSettings
        }));
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user?.id]);

  // Real-time subscription for profile updates
  useEffect(() => {
    if (!user?.id) return;

    const refetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setProfile(data);
        setFormData({
          fullName: data.full_name || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
        });
        const savedSettings = (data.social_links as any)?.settings || {};
        setSettings(prev => ({
          ...prev,
          ...savedSettings
        }));
      }
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
        () => {
          refetchProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      // Get current social_links and merge with settings
      const currentSocialLinks = (profile?.social_links as Record<string, unknown>) || {};
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          social_links: {
            ...currentSocialLinks,
            settings
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({ title: "Profile and settings saved successfully!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

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

      toast({ title: "Avatar updated!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-muted-foreground text-sm">Manage your account preferences</p>
        </div>
        <Button onClick={saveProfile} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile Section */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-lg sm:text-xl">
                    {formData.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={loading}
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">{formData.fullName || 'Your Name'}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="fullName" className="text-xs sm:text-sm">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-xs sm:text-sm">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 text-sm resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="location" className="text-xs sm:text-sm">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 text-sm"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="text-xs sm:text-sm">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="mt-1 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="email-notifications" className="text-sm">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="direct-messages" className="text-sm">Direct Messages</Label>
                <p className="text-xs text-muted-foreground">Allow artists to message you</p>
              </div>
              <Switch
                id="direct-messages"
                checked={settings.allowDirectMessages}
                onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              Privacy
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Control your visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="profile-visibility" className="text-sm">Public Profile</Label>
                <p className="text-xs text-muted-foreground">Make your profile visible to artists</p>
              </div>
              <Switch
                id="profile-visibility"
                checked={settings.profileVisibility}
                onCheckedChange={(checked) => handleSettingChange('profileVisibility', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              Security
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-xs sm:text-sm">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 text-sm"
              />
            </div>
            
            <Button 
              onClick={changePassword} 
              disabled={saving || !passwordData.newPassword}
              className="w-full"
              variant="outline"
            >
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientSettings;
