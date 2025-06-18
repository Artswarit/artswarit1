
import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "./profile/ProfileForm";
import TagManager from "./profile/TagManager";

interface ArtistProfileProps {
  isLoading: boolean;
}

const ArtistProfile = ({ isLoading }: ArtistProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: "Ananya Sharma",
    tagName: "cosmic_canvas",
    bio: "Contemporary visual artist specializing in abstract expressionism and digital art. Exploring the intersection of tradition and technology in Indian visual storytelling.",
    profileImage: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    coverImage: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    artBioTags: ["Abstract", "Digital", "Expressionism", "Contemporary"],
    artStyleTags: ["Bold colors", "Geometric", "Cultural fusion", "Minimalist"]
  });

  const handleChange = useCallback((field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const addArtBioTag = useCallback((tag: string) => {
    setProfile(prev => ({
      ...prev,
      artBioTags: [...prev.artBioTags, tag]
    }));
  }, []);

  const removeArtBioTag = useCallback((tag: string) => {
    setProfile(prev => ({
      ...prev,
      artBioTags: prev.artBioTags.filter(t => t !== tag)
    }));
  }, []);

  const addArtStyleTag = useCallback((tag: string) => {
    setProfile(prev => ({
      ...prev,
      artStyleTags: [...prev.artStyleTags, tag]
    }));
  }, []);

  const removeArtStyleTag = useCallback((tag: string) => {
    setProfile(prev => ({
      ...prev,
      artStyleTags: prev.artStyleTags.filter(t => t !== tag)
    }));
  }, []);

  const saveProfile = useCallback(() => {
    console.log("Saving profile:", profile);
    setIsEditing(false);
  }, [profile]);

  const toggleEdit = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const profileImages = useMemo(() => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Profile Image</CardTitle>
            <CardDescription className="text-sm">Your public profile photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border">
              <img 
                src={profile.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer">
                  <button className="text-white hover:underline text-sm">
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

      <div className="lg:col-span-2 space-y-4 lg:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Cover Image</CardTitle>
            <CardDescription className="text-sm">Displayed at the top of your profile page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-32 sm:h-40 rounded-md overflow-hidden">
              <img 
                src={profile.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer">
                  <button className="text-white hover:underline text-sm">
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 sm:h-10 w-32 sm:w-48 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-48 sm:h-64 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-48 sm:h-64 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold">Artist Profile</h2>
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
