
import { memo, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save } from "lucide-react";

interface ProfileFormProps {
  profile: {
    displayName: string;
    tagName: string;
    bio: string;
  };
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: (profile: any) => void;
  onChange: (field: string, value: string) => void;
}

const ProfileForm = memo(({ profile, isEditing, onToggleEdit, onSave, onChange }: ProfileFormProps) => {
  const handleInputChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(field, e.target.value);
  }, [onChange]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Artist Bio</CardTitle>
            <CardDescription>Tell others about yourself and your art</CardDescription>
          </div>
          {isEditing ? (
            <Button onClick={onSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          ) : (
            <Button onClick={onToggleEdit} className="flex items-center gap-2">
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
                value={profile.displayName}
                onChange={handleInputChange('displayName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">@</span>
                <Input
                  id="tagName"
                  value={profile.tagName}
                  onChange={handleInputChange('tagName')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={handleInputChange('bio')}
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Write your bio here..."
              />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{profile.displayName}</h3>
              <p className="text-muted-foreground">@{profile.tagName}</p>
            </div>
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ProfileForm.displayName = "ProfileForm";

export default ProfileForm;
