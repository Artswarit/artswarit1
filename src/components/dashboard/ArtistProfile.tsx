
import { useState, useCallback } from "react";
import { useProfile } from "@/hooks/useProfile";
import ProfileEditor from "./profile/ProfileEditor";
import ProfileImages from "./profile/ProfileImages";
import TagManager from "./profile/TagManager";

interface ArtistProfileProps {
  isLoading: boolean;
}

const ArtistProfile = ({ isLoading }: ArtistProfileProps) => {
  const { profile, loading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [tags, setTags] = useState({
    artBio: ["Abstract", "Digital", "Contemporary"],
    artStyle: ["Bold colors", "Geometric", "Minimalist"]
  });

  const toggleEdit = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const addArtBioTag = useCallback((tag: string) => {
    setTags(prev => ({
      ...prev,
      artBio: [...prev.artBio, tag]
    }));
  }, []);

  const removeArtBioTag = useCallback((tag: string) => {
    setTags(prev => ({
      ...prev,
      artBio: prev.artBio.filter(t => t !== tag)
    }));
  }, []);

  const addArtStyleTag = useCallback((tag: string) => {
    setTags(prev => ({
      ...prev,
      artStyle: [...prev.artStyle, tag]
    }));
  }, []);

  const removeArtStyleTag = useCallback((tag: string) => {
    setTags(prev => ({
      ...prev,
      artStyle: prev.artStyle.filter(t => t !== tag)
    }));
  }, []);

  if (isLoading || loading) {
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

      <ProfileImages isEditing={isEditing} />

      <ProfileEditor />

      <TagManager
        title="Art Bio Tags"
        description="Categories and themes in your work"
        tags={tags.artBio}
        onAddTag={addArtBioTag}
        onRemoveTag={removeArtBioTag}
        isEditing={isEditing}
        colorClass="bg-primary/10 text-primary"
      />

      <TagManager
        title="Art Style Tags"
        description="Your artistic style and techniques"
        tags={tags.artStyle}
        onAddTag={addArtStyleTag}
        onRemoveTag={removeArtStyleTag}
        isEditing={isEditing}
        colorClass="bg-purple-100 text-purple-700"
      />
    </div>
  );
};

export default ArtistProfile;
