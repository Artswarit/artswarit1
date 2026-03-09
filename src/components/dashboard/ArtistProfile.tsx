import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, Upload, Camera, Plus, X, MapPin, Globe, Briefcase, Clock, DollarSign, Instagram, Twitter, Linkedin, Youtube, Flag, Crown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
type UploadType = "avatar" | "cover";
interface ArtistProfileProps {
  isLoading: boolean;
  profile: any;
  updateProfile: (updates: any) => Promise<any>;
  uploadImage: (file: File, type: UploadType) => Promise<any>;
}

// Available categories for artists
const AVAILABLE_CATEGORIES = ["Musician", "Painter", "Photographer", "Sculptor", "Writer", "Graphic Designer", "Illustrator", "Animator", "Video Editor", "3D Artist", "Digital Artist", "Traditional Artist", "Tattoo Artist", "Fashion Designer", "Interior Designer", "Product Designer", "Pop", "Rock", "Electronic", "Jazz", "Classical", "Hip-Hop", "Portrait", "Landscape", "Abstract", "Surrealism", "Realism"];
const ArtistProfile = ({
  isLoading: externalLoading,
  profile,
  updateProfile,
  uploadImage
}: ArtistProfileProps) => {
  const {
    toast
  } = useToast();
  const {
    countries,
    userCurrencySymbol,
    formatPrice
  } = useCurrency();
  const { isPremium } = useAuth();
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
          youtube: socialLinks.youtube || ""
        }
      });
    }
  }, [profile]);
  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      });
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
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 10MB",
        variant: "destructive"
      });
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
  const saveProfile = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
  const toggleEdit = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
    return <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-md"></div>
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Artist Profile</h2>
        {isEditing ? <Button onClick={saveProfile} disabled={isSaving} className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 min-h-[48px]">
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save All Changes
          </Button> : <Button onClick={toggleEdit} className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 min-h-[48px]">
            <Edit className="h-5 w-5" />
            Edit Profile
          </Button>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Image Card */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Profile Image</CardTitle>
              <CardDescription className="text-xs font-medium">Your public profile photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="relative mx-auto w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl group">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]" onClick={() => avatarInputRef.current?.click()}>
                  {isUploadingAvatar ? <Loader2 className="h-10 w-10 animate-spin text-white" /> : <Camera className="h-10 w-10 text-white drop-shadow-lg" />}
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
              </div>
              
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl flex items-center justify-center gap-2">
                  {displayName}
                  {isPremium && <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500 drop-shadow-sm" />}
                </h3>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">@{tagName}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {isPremium && <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 font-bold px-3 py-1 rounded-full border-none shadow-sm">Premium</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cover Image Card */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl h-full">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Cover Image</CardTitle>
              <CardDescription className="text-xs font-medium">Displayed at the top of your profile page</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden group cursor-pointer shadow-inner" onClick={() => coverInputRef.current?.click()}>
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                  {isUploadingCover ? <Loader2 className="h-10 w-10 animate-spin text-white" /> : <div className="flex flex-col items-center gap-2 text-white">
                      <Upload className="h-10 w-10 drop-shadow-lg" />
                      <span className="font-black uppercase tracking-widest text-xs">Change Cover</span>
                    </div>}
                </div>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={isUploadingCover} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Basic Info Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-black uppercase tracking-tight">Basic Information</CardTitle>
          <CardDescription className="text-xs font-medium">Your display name, bio, and basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {isEditing ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Display Name *</Label>
                <Input id="displayName" value={editForm.displayName} onChange={e => handleChange('displayName', e.target.value)} placeholder="Your display name" className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-medium min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  <Flag className="h-3 w-3 inline mr-1 mb-0.5" />
                  Country *
                </Label>
                <Select value={editForm.country} onValueChange={value => handleChange('country', value)}>
                  <SelectTrigger className="w-full h-12 rounded-xl bg-muted/30 border-none focus:ring-primary/20 font-medium min-h-[48px]">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] z-[9999] bg-background border border-border shadow-2xl rounded-2xl" position="popper" sideOffset={4}>
                    {countries.length === 0 ? <div className="p-4 text-center text-muted-foreground">Loading countries...</div> : countries.map(country => <SelectItem key={country.country_code} value={country.country_code} className="rounded-lg m-1 font-medium">
                          {country.country_name} ({country.currency_symbol} {country.currency_code})
                        </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  <MapPin className="h-3 w-3 inline mr-1 mb-0.5" />
                  City *
                </Label>
                <Input id="city" value={editForm.city} onChange={e => handleChange('city', e.target.value)} placeholder="Enter your city name" className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-medium min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  <MapPin className="h-3 w-3 inline mr-1 mb-0.5" />
                  Full Address (optional)
                </Label>
                <Input id="location" value={editForm.location} onChange={e => handleChange('location', e.target.value)} placeholder="e.g., Los Angeles, CA" className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-medium min-h-[48px]" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Bio *</Label>
                <textarea id="bio" value={editForm.bio} onChange={e => handleChange('bio', e.target.value)} className="w-full min-h-[120px] rounded-2xl border-none bg-muted/30 px-4 py-3 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none" placeholder="Tell others about yourself and your art..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  <Globe className="h-3 w-3 inline mr-1 mb-0.5" />
                  Website
                </Label>
                <Input id="website" value={editForm.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://yourwebsite.com" className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-medium min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYears" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  <Briefcase className="h-3 w-3 inline mr-1 mb-0.5" />
                  Experience (years)
                </Label>
                <Input id="experienceYears" type="number" min="0" value={editForm.experienceYears} onChange={e => handleChange('experienceYears', e.target.value)} placeholder="e.g., 5" className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-medium min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  <DollarSign className="h-3 w-3 inline mr-1 mb-0.5" />
                  Hourly Rate ({userCurrencySymbol || '$'})
                </Label>
                <Input id="hourlyRate" type="number" min="0" value={editForm.hourlyRate} onChange={e => handleChange('hourlyRate', e.target.value)} placeholder="e.g., 50" className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-medium min-h-[48px]" />
              </div>
            </div> : <div className="space-y-6">
              <div>
                <h3 className="font-black text-2xl tracking-tight">{displayName}</h3>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">@{tagName}</p>
              </div>
              <p className="text-sm font-medium leading-relaxed max-w-2xl text-foreground/80">{bio}</p>
              <div className="flex flex-wrap gap-4 sm:gap-6 pt-2">
                {profile?.country && <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full text-xs font-bold uppercase tracking-widest">
                    <Flag className="h-4 w-4 text-primary" />
                    {countries.find(c => c.country_code === profile.country)?.country_name || profile.country}
                    {profile?.city && `, ${profile.city}`}
                  </div>}
                {profile?.location && <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full text-xs font-bold uppercase tracking-widest">
                    <MapPin className="h-4 w-4 text-primary" />
                    {profile.location}
                  </div>}
                {profile?.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>}
                {profile?.experience_years && <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full text-xs font-bold uppercase tracking-widest">
                    <Briefcase className="h-4 w-4 text-primary" />
                    {profile.experience_years} years exp
                  </div>}
                {profile?.hourly_rate && <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-xs font-black uppercase tracking-widest text-primary">
                    <DollarSign className="h-4 w-4" />
                    {formatPrice(profile.hourly_rate)}/hr
                  </div>}
              </div>
            </div>}
        </CardContent>
      </Card>

      {/* Categories/Tags Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-black uppercase tracking-tight">Categories & Skills *</CardTitle>
          <CardDescription className="text-xs font-medium">Add categories and skills that describe your work. This helps clients find you.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2.5 mb-6">
            {(isEditing ? editForm.tags : profile?.tags || []).map(tag => <Badge key={tag} variant="secondary" className="px-4 py-1.5 text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-primary/10 text-primary border-none rounded-full">
                {tag}
                {isEditing && <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive transition-colors" type="button">
                    <X className="h-3.5 w-3.5" />
                  </button>}
              </Badge>)}
            {(isEditing ? editForm.tags : profile?.tags || []).length === 0 && <p className="text-sm font-medium text-muted-foreground italic">No categories added yet</p>}
          </div>

          {isEditing && <div className="space-y-6">
              <div className="flex gap-2">
                <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add a custom tag" className="h-12 rounded-xl bg-muted/30 border-none font-medium min-h-[48px]" onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(newTag);
              }
            }} />
                <Button type="button" onClick={() => handleAddTag(newTag)} size="icon" className="h-12 w-12 rounded-xl shrink-0 shadow-lg shadow-primary/10 min-h-[48px] min-w-[48px]">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">Popular categories (click to add):</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CATEGORIES.filter(cat => !editForm.tags.includes(cat)).slice(0, 12).map(category => <Button key={category} type="button" variant="outline" size="sm" onClick={() => handleAddTag(category)} className="text-[10px] font-black uppercase tracking-widest rounded-full border-muted-foreground/20 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all h-9">
                      + {category}
                    </Button>)}
                </div>
              </div>
            </div>}
        </CardContent>
      </Card>

      {/* Social Links Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-black uppercase tracking-tight">Social Links</CardTitle>
          <CardDescription className="text-xs font-medium">Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Instagram className="h-3.5 w-3.5" /> Instagram
                </Label>
                <Input id="instagram" value={editForm.socialLinks.instagram} onChange={e => handleSocialLinkChange('instagram', e.target.value)} placeholder="Instagram URL" className="h-12 rounded-xl bg-muted/30 border-none font-medium min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Twitter className="h-3.5 w-3.5" /> Twitter / X
                </Label>
                <Input id="twitter" value={editForm.socialLinks.twitter} onChange={e => handleSocialLinkChange('twitter', e.target.value)} placeholder="Twitter URL" className="h-12 rounded-xl bg-muted/30 border-none font-medium min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </Label>
                <Input id="linkedin" value={editForm.socialLinks.linkedin} onChange={e => handleSocialLinkChange('linkedin', e.target.value)} placeholder="LinkedIn URL" className="h-12 rounded-xl bg-muted/30 border-none font-medium min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Youtube className="h-3.5 w-3.5" /> YouTube
                </Label>
                <Input id="youtube" value={editForm.socialLinks.youtube} onChange={e => handleSocialLinkChange('youtube', e.target.value)} placeholder="YouTube URL" className="h-12 rounded-xl bg-muted/30 border-none font-medium min-h-[48px]" />
              </div>
            </div> : <div className="flex flex-wrap gap-4">
              {profile?.social_links?.instagram && <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#E1306C]/10 rounded-full text-[#E1306C] hover:bg-[#E1306C]/20 transition-colors">
                  <Instagram className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Instagram</span>
                </a>}
              {profile?.social_links?.twitter && <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-black/10 rounded-full text-black hover:bg-black/20 transition-colors">
                  <Twitter className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Twitter</span>
                </a>}
              {profile?.social_links?.linkedin && <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0077B5]/10 rounded-full text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors">
                  <Linkedin className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">LinkedIn</span>
                </a>}
              {profile?.social_links?.youtube && <a href={profile.social_links.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#FF0000]/10 rounded-full text-[#FF0000] hover:bg-[#FF0000]/20 transition-colors">
                  <Youtube className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">YouTube</span>
                </a>}
              {!profile?.social_links?.instagram && !profile?.social_links?.twitter && !profile?.social_links?.linkedin && !profile?.social_links?.youtube && <p className="text-sm font-medium text-muted-foreground italic">No social links added yet</p>}
            </div>}
        </CardContent>
      </Card>
    </div>;
};
export default ArtistProfile;