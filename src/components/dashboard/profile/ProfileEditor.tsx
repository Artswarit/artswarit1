
import { memo, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const ProfileEditor = memo(() => {
  const { profile, updateProfile, loading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    website: profile?.website || ""
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const result = await updateProfile(formData);
    if (!result?.error) {
      setIsEditing(false);
    }
    setSaving(false);
  }, [formData, updateProfile]);

  const toggleEdit = useCallback(() => {
    if (isEditing) {
      // Reset form data if canceling
      setFormData({
        full_name: profile?.full_name || "",
        bio: profile?.bio || "",
        location: profile?.location || "",
        website: profile?.website || ""
      });
    }
    setIsEditing(!isEditing);
  }, [isEditing, profile]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your public profile details</CardDescription>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={toggleEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
            </div>
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
              <Label htmlFor="full_name">Display Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Your location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="min-h-[120px] resize-none"
                placeholder="Tell others about yourself and your art..."
              />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">
                {profile?.full_name || "Name not set"}
              </h3>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
            {profile?.location && (
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm">{profile.location}</p>
              </div>
            )}
            {profile?.website && (
              <div>
                <Label className="text-sm font-medium">Website</Label>
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {profile.website}
                </a>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Bio</Label>
              <p className="text-sm">{profile?.bio || "No bio added yet"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ProfileEditor.displayName = "ProfileEditor";

export default ProfileEditor;
