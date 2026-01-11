import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Save, Camera, Loader2, MapPin, User, ImageIcon, Globe, CheckCircle2, AlertCircle } from "lucide-react";

interface CountryCurrency {
  id: string;
  country_code: string;
  country_name: string;
  currency_code: string;
  currency_symbol: string;
}

const ClientProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateUserLocation } = useCurrency();
  const [profile, setProfile] = useState<any>(null);
  const [countries, setCountries] = useState<CountryCurrency[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    country: "",
    city: "",
    website: "",
  });

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    const fields = [
      { value: formData.fullName, weight: 20, label: 'Display Name' },
      { value: formData.bio, weight: 25, label: 'Bio' },
      { value: formData.country, weight: 20, label: 'Country' },
      { value: profile?.avatar_url, weight: 25, label: 'Profile Photo' },
      { value: profile?.cover_url, weight: 10, label: 'Banner Image' },
    ];
    
    let completed = 0;
    const missing: string[] = [];
    
    fields.forEach(field => {
      if (field.value && field.value.trim && field.value.trim() !== '') {
        completed += field.weight;
      } else if (field.value) {
        completed += field.weight;
      } else {
        missing.push(field.label);
      }
    });
    
    return { percentage: completed, missing };
  };

  const profileCompletion = calculateProfileCompletion();

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      const { data, error } = await supabase
        .from('country_currencies')
        .select('*')
        .order('country_name');
      
      if (!error && data) {
        setCountries(data);
      }
      setLoadingCountries(false);
    };
    fetchCountries();
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }
      
      if (data) {
        setProfile(data);
        setFormData({
          fullName: data.full_name || "",
          bio: data.bio || "",
          country: data.country || "",
          city: data.city || "",
          website: data.website || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user?.id]);

  // Real-time subscription for profile updates
  useEffect(() => {
    if (!user?.id) return;

    const refetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setProfile(data);
        setFormData({
          fullName: data.full_name || "",
          bio: data.bio || "",
          country: data.country || "",
          city: data.city || "",
          website: data.website || "",
        });
      }
    };

    const channel = supabase
      .channel(`client-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          refetchProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = async (countryCode: string) => {
    setFormData(prev => ({ ...prev, country: countryCode }));
    
    // Find the country data to get currency
    const countryData = countries.find(c => c.country_code === countryCode);
    if (countryData) {
      // Update location which also updates currency
      await updateUserLocation(countryCode, formData.city);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    
    // Validation
    if (!formData.fullName.trim()) {
      toast({ variant: "destructive", title: "Display name is required" });
      return;
    }
    if (!formData.bio.trim()) {
      toast({ variant: "destructive", title: "Bio is required" });
      return;
    }
    if (!formData.country) {
      toast({ variant: "destructive", title: "Country is required", description: "Please select your country to set your local currency" });
      return;
    }
    
    setSaving(true);
    try {
      // Get currency code for the selected country
      const countryData = countries.find(c => c.country_code === formData.country);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          bio: formData.bio,
          country: formData.country,
          city: formData.city,
          website: formData.website,
          currency: countryData?.currency_code || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({ title: "Profile saved successfully!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev: any) => ({ ...prev, avatar_url: urlData.publicUrl }));
      toast({ title: "Avatar updated!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingBanner(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev: any) => ({ ...prev, cover_url: urlData.publicUrl }));
      toast({ title: "Banner updated!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    } finally {
      setUploadingBanner(false);
    }
  };

  const selectedCountry = countries.find(c => c.country_code === formData.country);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Profile Completion Banner */}
      <Card className={`transition-all duration-300 ${
        profileCompletion.percentage === 100 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-amber-500/10 border-amber-500/30'
      }`}>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              {profileCompletion.percentage === 100 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <span className="font-medium">
                Profile Completion: {profileCompletion.percentage}%
              </span>
            </div>
            <div className="flex-1 w-full">
              <Progress value={profileCompletion.percentage} className="h-2" />
            </div>
            {profileCompletion.missing.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Missing: {profileCompletion.missing.join(', ')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Banner Section */}
      <Card className="overflow-hidden">
        <div className="relative h-32 sm:h-48 w-full group">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
              backgroundImage: profile?.cover_url 
                ? `url(${profile.cover_url})` 
                : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)' 
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            {uploadingBanner ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <div className="flex flex-col items-center text-white">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Upload Banner</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
              disabled={uploadingBanner}
            />
          </label>
        </div>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            Recommended size: 1200x300 pixels. This banner will appear on your public profile.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Complete Your Profile</h2>
          <p className="text-muted-foreground text-sm">Fill in your profile to start discovering and working with artists</p>
        </div>
        <Button onClick={saveProfile} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile Section */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Basic Information
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-lg sm:text-xl">
                    {formData.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={loading}
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">{formData.fullName || 'Your Name'}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{user?.email}</p>
                {!profile?.avatar_url && (
                  <p className="text-xs text-amber-600 mt-1">* Profile picture is required</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="fullName" className="text-xs sm:text-sm">Display Name <span className="text-destructive">*</span></Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 text-sm"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-xs sm:text-sm">Bio <span className="text-destructive">*</span></Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 text-sm resize-none"
                  placeholder="Tell us about yourself, your interests, what kind of projects you're looking for..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div>
                <Label htmlFor="website" className="text-xs sm:text-sm flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Website (Optional)
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="mt-1 text-sm"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Section */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              Location & Currency
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your country sets your local currency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="country" className="text-xs sm:text-sm">Country <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.country} 
                onValueChange={handleCountryChange}
                disabled={loadingCountries}
              >
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select your country"} />
                </SelectTrigger>
                <SelectContent 
                  className="z-[200] bg-background border shadow-lg max-h-[300px]"
                  position="popper"
                  sideOffset={4}
                >
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.country_code}>
                      {country.country_name} ({country.currency_symbol} {country.currency_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                This sets your local currency for all prices on the platform
              </p>
            </div>

            <div>
              <Label htmlFor="city" className="text-xs sm:text-sm">City (Optional)</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="mt-1 text-sm"
                placeholder="Your city"
              />
            </div>

            {selectedCountry && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Selected Currency</p>
                <p className="text-lg font-bold text-primary">
                  {selectedCountry.currency_symbol} {selectedCountry.currency_code}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All prices will be displayed in {selectedCountry.currency_code}
                </p>
              </div>
            )}

            {/* Profile Preview */}
            <div className="p-4 border rounded-lg bg-muted/20">
              <p className="text-sm font-medium mb-2">Profile Preview</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>{formData.fullName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{formData.fullName || 'Your Name'}</p>
                  <p className="text-xs text-muted-foreground">
                    {[formData.city, selectedCountry?.country_name].filter(Boolean).join(', ') || 'Location not set'}
                  </p>
                </div>
              </div>
              {formData.bio && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{formData.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientProfile;
