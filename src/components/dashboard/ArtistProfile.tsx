import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "./profile/ProfileForm";
import TagManager from "./profile/TagManager";
import { useProfile } from "@/hooks/useProfile";

interface ArtistProfileProps {
  isLoading: boolean;
}

const ArtistProfile = ({ isLoading }: ArtistProfileProps) => {
  const { profile: userProfile, loading: profileLoading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  
  // Convert userProfile to local profile format
  const profile = useMemo(() => ({
    displayName: userProfile?.full_name || "",
    tagName: userProfile?.email?.split('@')[0] || "",
    bio: userProfile?.bio || "",
    profileImage: userProfile?.avatar_url || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    coverImage: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    artBioTags: [],
    artStyleTags: []
  }), [userProfile]);

  const handleChange = useCallback(async (field: string, value: string) => {
    const updateData: any = {};
    if (field === 'displayName') updateData.full_name = value;
    if (field === 'bio') updateData.bio = value;
    if (field === 'profileImage') updateData.avatar_url = value;
    
    if (Object.keys(updateData).length > 0) {
      await updateProfile(updateData);
    }
  }, [updateProfile]);

  const addArtBioTag = useCallback(async (tag: string) => {
    // For now, just log since tags are not in the profile table
    console.log('Adding tag:', tag);
  }, []);

  const removeArtBioTag = useCallback(async (tag: string) => {
    // For now, just log since tags are not in the profile table
    console.log('Removing tag:', tag);
  }, []);

  const addArtStyleTag = useCallback((tag: string) => {
    console.log('Adding style tag:', tag);
  }, []);

  const removeArtStyleTag = useCallback((tag: string) => {
    console.log('Removing style tag:', tag);
  }, []);

  const saveProfile = useCallback(() => {
    setIsEditing(false);
  }, []);

  const toggleEdit = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const profileImages = useMemo(() => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Profile Image</CardTitle>
            <CardDescription>Your public profile photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative mx-auto w-40 h-40 rounded-full overflow-hidden border">
              <img 
                src={profile.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <button className="text-white hover:underline">
                    Change
                  </button>
                </div>
              )}
            </div>
            
            {!isEditing && (
              <div className="text-center">
                <h3 className="font-semibold text-lg">{profile.displayName}</h3>
                <p className="text-muted-foreground">@{profile.tagName}</p>
              </div>
            )}
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
            <div className="relative w-full h-40 rounded-md overflow-hidden">
              <img 
                src={profile.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <button className="text-white hover:underline">
                    Change Cover
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ), [profile.profileImage, profile.coverImage, profile.displayName, profile.tagName, isEditing]);

  if (isLoading || profileLoading) {
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

      {profileImages}

      <ProfileForm
        profile={profile}
        isEditing={isEditing}
        onToggleEdit={toggleEdit}
        onSave={saveProfile}
        onChange={handleChange}
      />

      <TagManager
        title="Art Bio Tags"
        description="Categories and themes in your work"
        tags={profile.artBioTags}
        onAddTag={addArtBioTag}
        onRemoveTag={removeArtBioTag}
        isEditing={isEditing}
        colorClass="bg-primary/10 text-primary"
      />

      <TagManager
        title="Art Style Tags"
        description="Your artistic style and techniques"
        tags={profile.artStyleTags}
        onAddTag={addArtStyleTag}
        onRemoveTag={removeArtStyleTag}
        isEditing={isEditing}
        colorClass="bg-purple-100 text-purple-700"
      />
    </div>
  );
};

export default ArtistProfile;