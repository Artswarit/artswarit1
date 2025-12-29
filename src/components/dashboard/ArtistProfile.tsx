import { useState, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, Upload, Camera } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface ArtistProfileProps {
  isLoading: boolean;
}

const ArtistProfile = ({ isLoading: externalLoading }: ArtistProfileProps) => {
  const { profile, loading, updateProfile, uploadImage } = useProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [editForm, setEditForm] = useState({
    displayName: "",
    tagName: "",
    bio: ""
  });

  // Initialize form when profile loads
  useMemo(() => {
    if (profile) {
      setEditForm({
        displayName: profile.full_name || "",
        tagName: profile.email?.split("@")[0] || "",
        bio: profile.bio || ""
      });
    }
  }, [profile]);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 5MB", variant: "destructive" });
      return;
    }

    setIsUploadingAvatar(true);
    await uploadImage(file, 'avatar');
    setIsUploadingAvatar(false);
    
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  }, [uploadImage, toast]);

  const handleCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 10MB", variant: "destructive" });
      return;
    }

    setIsUploadingCover(true);
    await uploadImage(file, 'cover');
    setIsUploadingCover(false);
    
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  }, [uploadImage, toast]);

  const handleChange = useCallback((field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const saveProfile = useCallback(async () => {
    setIsSaving(true);
    await updateProfile({
      full_name: editForm.displayName,
      bio: editForm.bio
    });
    setIsSaving(false);
    setIsEditing(false);
  }, [editForm, updateProfile]);

  const toggleEdit = useCallback(() => {
    if (!isEditing && profile) {
      setEditForm({
        displayName: profile.full_name || "",
        tagName: profile.email?.split("@")[0] || "",
        bio: profile.bio || ""
      });
    }
    setIsEditing(prev => !prev);
  }, [isEditing, profile]);

  const displayName = profile?.full_name || "Your Name";
  const tagName = profile?.email?.split("@")[0] || "username";
  const bio = profile?.bio || "Tell others about yourself and your art...";
  const avatarUrl = profile?.avatar_url || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200";
  const coverUrl = profile?.cover_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800";

  if (externalLoading || loading) {
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
        <h2 className="text-xl font-semibold">Artist Profile</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
              <CardDescription>Your public profile photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative mx-auto w-40 h-40 rounded-full overflow-hidden border group">
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {isUploadingAvatar ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                </div>
                <input 
                  ref={avatarInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-lg">{displayName}</h3>
                <p className="text-muted-foreground">@{tagName}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
              <CardDescription>Displayed at the top of your profile page</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="relative w-full h-40 rounded-md overflow-hidden group cursor-pointer"
                onClick={() => coverInputRef.current?.click()}
              >
                <img 
                  src={coverUrl} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploadingCover ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  ) : (
                    <div className="flex items-center gap-2 text-white">
                      <Upload className="h-6 w-6" />
                      <span>Change Cover</span>
                    </div>
                  )}
                </div>
                <input 
                  ref={coverInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleCoverUpload}
                  disabled={isUploadingCover}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Artist Bio</CardTitle>
              <CardDescription>Tell others about yourself and your art</CardDescription>
            </div>
            {isEditing ? (
              <Button onClick={saveProfile} disabled={isSaving} className="flex items-center gap-2">
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
            ) : (
              <Button onClick={toggleEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={editForm.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagName">Tag Name</Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-1">@</span>
                  <Input
                    id="tagName"
                    value={editForm.tagName}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Tag name is based on your email</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Write your bio here..."
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{displayName}</h3>
                <p className="text-muted-foreground">@{tagName}</p>
              </div>
              <p className="text-sm">{bio}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtistProfile;
