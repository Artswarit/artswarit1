
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
    <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-md overflow-hidden">
      <CardHeader className="p-6 sm:p-10 border-b border-border/10">
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">Artist Bio</CardTitle>
            <CardDescription className="text-sm font-medium">Tell others about yourself and your art</CardDescription>
          </div>
          {isEditing ? (
            <Button onClick={onSave} className="flex items-center gap-2 h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Save className="h-5 w-5" />
              Save
            </Button>
          ) : (
            <Button onClick={onToggleEdit} className="flex items-center gap-2 h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Edit className="h-5 w-5" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-10 space-y-8 sm:space-y-6">
        {isEditing ? (
          <>
            <div className="space-y-3">
              <Label htmlFor="displayName" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Display Name</Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={handleInputChange('displayName')}
                className="h-14 rounded-xl border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-base font-bold transition-all"
                placeholder="Your artist name"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="tagName" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Tag Name</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black">@</span>
                <Input
                  id="tagName"
                  value={profile.tagName}
                  onChange={handleInputChange('tagName')}
                  className="h-14 pl-9 rounded-xl border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-base font-bold transition-all"
                  placeholder="username"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Bio</Label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={handleInputChange('bio')}
                className="w-full min-h-[180px] rounded-2xl border border-border/40 bg-background px-4 py-4 text-base font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all leading-relaxed"
                placeholder="Tell your story, your inspirations, and what makes your art unique..."
              />
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-black text-3xl tracking-tighter">{profile.displayName}</h3>
              <p className="text-primary font-black text-sm tracking-widest uppercase">@{profile.tagName}</p>
            </div>
            <p className="text-base font-medium leading-relaxed text-muted-foreground whitespace-pre-wrap">{profile.bio || "No bio yet. Tell the world about your artistic journey!"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ProfileForm.displayName = "ProfileForm";

export default ProfileForm;
