import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, Upload, Camera, Plus, X, MapPin, Globe, Briefcase, Clock, DollarSign, Instagram, Twitter, Linkedin, Youtube, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";

type UploadType = "avatar" | "cover";

interface ArtistProfileProps {
  isLoading: boolean;
  profile: any;
  updateProfile: (updates: any) => Promise<any>;
  uploadImage: (file: File, type: UploadType) => Promise<any>;
}

// Available categories for artists
const AVAILABLE_CATEGORIES = [
  "Musician", "Painter", "Photographer", "Sculptor", "Writer", 
  "Graphic Designer", "Illustrator", "Animator", "Video Editor",
  "3D Artist", "Digital Artist", "Traditional Artist", "Tattoo Artist",
  "Fashion Designer", "Interior Designer", "Product Designer",
  "Pop", "Rock", "Electronic", "Jazz", "Classical", "Hip-Hop",
  "Portrait", "Landscape", "Abstract", "Surrealism", "Realism"
];

const ArtistProfile = ({ isLoading: externalLoading, profile, updateProfile, uploadImage }: ArtistProfileProps) => {
  const { toast } = useToast();
  const { countries, userCurrencySymbol, formatPrice } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    hourlyRate: "",
    experienceYears: "",
    tags: [] as string[],
    country: "",
    city: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: ""
    }
  });

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      const socialLinks = profile.social_links || {};
      setEditForm({
        displayName: profile.full_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        hourlyRate: profile.hourly_rate?.toString() || "",
        experienceYears: profile.experience_years?.toString() || "",
        tags: profile.tags || [],
        country: profile.country || "",
        city: profile.city || "",
        socialLinks: {
          instagram: socialLinks.instagram || "",
          twitter: socialLinks.twitter || "",
          linkedin: socialLinks.linkedin || "",
          youtube: socialLinks.youtube || "",
        },
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

  const handleSocialLinkChange = useCallback((platform: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  }, []);

  const handleAddTag = useCallback((tag: string) => {
    if (tag.trim() && !editForm.tags.includes(tag.trim())) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
    setNewTag("");
  }, [editForm.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const saveProfile = useCallback(async () => {
    setIsSaving(true);
    
    // Find the currency for the selected country
    const selectedCountry = countries.find(c => c.country_code === editForm.country);
    const currency = selectedCountry?.currency_code || 'USD';
    
    await updateProfile({
      full_name: editForm.displayName,
      bio: editForm.bio,
      location: editForm.location,
      website: editForm.website,
      hourly_rate: editForm.hourlyRate ? parseFloat(editForm.hourlyRate) : null,
      experience_years: editForm.experienceYears ? parseInt(editForm.experienceYears) : null,
      tags: editForm.tags,
      country: editForm.country || null,
      city: editForm.city || null,
      currency: currency,
      social_links: editForm.socialLinks
    });
    setIsSaving(false);
    setIsEditing(false);
  }, [editForm, updateProfile, countries]);

  const toggleEdit = useCallback(() => {
    if (!isEditing && profile) {
      const socialLinks = profile.social_links || {};
      setEditForm({
        displayName: profile.full_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        hourlyRate: profile.hourly_rate?.toString() || "",
        experienceYears: profile.experience_years?.toString() || "",
        tags: profile.tags || [],
        country: profile.country || "",
        city: profile.city || "",
        socialLinks: {
          instagram: socialLinks.instagram || "",
          twitter: socialLinks.twitter || "",
          linkedin: socialLinks.linkedin || "",
          youtube: socialLinks.youtube || ""
        }
      });
    }
    setIsEditing(prev => !prev);
  }, [isEditing, profile]);

  const displayName = profile?.full_name || "Your Name";
  const tagName = profile?.email?.split("@")[0] || "username";
  const bio = profile?.bio || "Tell others about yourself and your art...";
  const avatarUrl = profile?.avatar_url || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200";
  const coverUrl = profile?.cover_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800";

  if (externalLoading || !profile) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-md"></div>
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Artist Profile</h2>
        {isEditing ? (
          <Button onClick={saveProfile} disabled={isSaving} className="flex items-center gap-2">
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All Changes
          </Button>
        ) : (
          <Button onClick={toggleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Image Card */}
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
                {profile?.is_verified && (
                  <Badge variant="secondary" className="mt-2">Verified</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cover Image Card */}
        <div className="lg:col-span-2">
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

      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your display name, bio, and basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={editForm.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">
                  <Flag className="h-4 w-4 inline mr-1" />
                  Country *
                </Label>
                <Select
                  value={editForm.country}
                  onValueChange={(value) => handleChange('country', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent 
                    className="max-h-[300px] z-[9999] bg-background border border-border shadow-lg"
                    position="popper"
                    sideOffset={4}
                  >
                    {countries.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">Loading countries...</div>
                    ) : (
                      countries.map((country) => (
                        <SelectItem key={country.country_code} value={country.country_code}>
                          {country.country_name} ({country.currency_symbol} {country.currency_code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  City *
                </Label>
                <Input
                  id="city"
                  value={editForm.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Enter your city name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Full Address (optional)
                </Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g., Los Angeles, CA"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio *</Label>
                <textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Tell others about yourself and your art..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={editForm.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYears">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Experience (years)
                </Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  value={editForm.experienceYears}
                  onChange={(e) => handleChange('experienceYears', e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Hourly Rate ({userCurrencySymbol || '$'})
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  value={editForm.hourlyRate}
                  onChange={(e) => handleChange('hourlyRate', e.target.value)}
                  placeholder="e.g., 50"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{displayName}</h3>
                <p className="text-muted-foreground">@{tagName}</p>
              </div>
              <p className="text-sm">{bio}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile?.country && (
                  <span className="flex items-center gap-1">
                    <Flag className="h-4 w-4" />
                    {countries.find(c => c.country_code === profile.country)?.country_name || profile.country}
                    {profile?.city && `, ${profile.city}`}
                  </span>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                {profile?.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {profile?.experience_years && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {profile.experience_years} years experience
                  </span>
                )}
                {profile?.hourly_rate && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatPrice(profile.hourly_rate)}/hour
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories/Tags Card */}
      <Card>
        <CardHeader>
          <CardTitle>Categories & Skills *</CardTitle>
          <CardDescription>Add categories and skills that describe your work. This helps clients find you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {(isEditing ? editForm.tags : profile?.tags || []).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="px-3 py-1 text-sm flex items-center gap-1 bg-primary/10 text-primary"
              >
                {tag}
                {isEditing && (
                  <button 
                    onClick={() => handleRemoveTag(tag)} 
                    className="ml-1 hover:text-destructive"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {(isEditing ? editForm.tags : profile?.tags || []).length === 0 && (
              <p className="text-sm text-muted-foreground">No categories added yet</p>
            )}
          </div>

          {isEditing && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a custom tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(newTag);
                    }
                  }}
                />
                <Button type="button" onClick={() => handleAddTag(newTag)} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Popular categories (click to add):</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CATEGORIES.filter(cat => !editForm.tags.includes(cat)).slice(0, 12).map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTag(category)}
                      className="text-xs"
                    >
                      + {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Links Card */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={editForm.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-sky-500" />
                  Twitter / X
                </Label>
                <Input
                  id="twitter"
                  value={editForm.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-600" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={editForm.socialLinks.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  value={editForm.socialLinks.youtube}
                  onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/@username"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {profile?.social_links?.instagram && (
                <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  Instagram
                </a>
              )}
              {profile?.social_links?.twitter && (
                <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                  <Twitter className="h-5 w-5 text-sky-500" />
                  Twitter
                </a>
              )}
              {profile?.social_links?.linkedin && (
                <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  LinkedIn
                </a>
              )}
              {profile?.social_links?.youtube && (
                <a href={profile.social_links.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                  <Youtube className="h-5 w-5 text-red-500" />
                  YouTube
                </a>
              )}
              {!profile?.social_links?.instagram && !profile?.social_links?.twitter && !profile?.social_links?.linkedin && !profile?.social_links?.youtube && (
                <p className="text-sm text-muted-foreground">No social links added yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtistProfile;
