
import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface ProfileImagesProps {
  isEditing: boolean;
}

const ProfileImages = memo(({ isEditing }: ProfileImagesProps) => {
  const { profile } = useProfile();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Profile Image</CardTitle>
            <CardDescription>Your public profile photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative mx-auto w-40 h-40 rounded-full overflow-hidden border bg-gray-100">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Upload className="h-8 w-8" />
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <Button size="sm" variant="secondary">
                    Upload
                  </Button>
                </div>
              )}
            </div>
            
            {!isEditing && profile && (
              <div className="text-center">
                <h3 className="font-semibold text-lg">{profile.full_name || "Artist"}</h3>
                <p className="text-muted-foreground">@{profile.email?.split('@')[0]}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
            <CardDescription>Displayed at the top of your profile page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-40 rounded-md overflow-hidden bg-gray-100 border">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Upload className="h-8 w-8" />
              </div>
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <Button size="sm" variant="secondary">
                    Upload Cover
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

ProfileImages.displayName = "ProfileImages";

export default ProfileImages;
