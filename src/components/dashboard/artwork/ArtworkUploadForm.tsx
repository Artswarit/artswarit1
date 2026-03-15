import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useArtworks } from "@/hooks/useArtworks";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ImageIcon, MusicIcon, VideoIcon, AlertTriangle, Crown, Lock, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";


import { FeatureLimitBanner } from "@/components/premium/FeatureLimitBanner";
import { useCurrency } from "@/contexts/CurrencyContext";

const contentTypes = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "audio", label: "Audio", icon: MusicIcon },
  { id: "video", label: "Video", icon: VideoIcon },
];

const visibilityOptions = [
  { id: "public", label: "Public - Visible to everyone" },
  { id: "private", label: "Private - Only visible to you" },
  { id: "followers", label: "Followers Only - Visible to your followers" },
];

const categories = [
  "Digital Art", "Music", "Hip-Hop", "Abstract Art", "Landscape", 
  "Portrait", "Music Video", "Contemporary", "Traditional", "Photography",
  "Musicians", "Writers", "Rappers", "Editors", "Scriptwriters", 
  "Photographers", "Illustrators", "Voice Artists", "Animators", 
  "UI/UX Designers", "Singers", "Dancers"
];

interface ArtworkUploadFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const ArtworkUploadForm = ({ onCancel, onSuccess }: ArtworkUploadFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { userCurrency, userCurrencySymbol } = useCurrency();
  const { uploadArtwork } = useArtworks();
  const { canUploadPortfolio, portfolioCount, portfolioLimit, isProArtist, refresh: refreshGating } = useFeatureGating(user?.id);
  const [selectedType, setSelectedType] = useState("image");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [visibilityType, setVisibilityType] = useState("free");
  const [scheduleRelease, setScheduleRelease] = useState(false);
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(undefined);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAiConfirm, setShowAiConfirm] = useState(false);
  const [aiConfirmed, setAiConfirmed] = useState(false);

  const handleUpgrade = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate('/artist-dashboard?tab=premium');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setSelectedFiles(fileArray);
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check portfolio limit before uploading
    if (!canUploadPortfolio) {
      toast({
        title: "Portfolio limit reached",
        description: `You've reached your limit of ${portfolioLimit} portfolio items. Upgrade to Pro for unlimited uploads!`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Validation
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your artwork.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a category for your artwork.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    if (visibilityType === "premium" && !price) {
      toast({
        title: "Error",
        description: "Please enter a price for your premium/exclusive content.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }



    // Create artwork data object
    const artworkData = {
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory,
      media_type: selectedType,
      file: selectedFiles[0], // Use first selected file
      price: visibilityType === "premium" ? price : null,
      currency: userCurrency, // Store user's currency
      visibility,
      access_type: visibilityType,
      tags: []
    };

    // Upload artwork using the hook
    const result = await uploadArtwork(artworkData);

    if (result.error) {
      toast({
        title: "Upload Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Your artwork has been uploaded successfully!",
      });
      
      // Refresh gating limits instantly
      refreshGating();
      
      // Reset form
      setTitle("");
      setDescription("");
      setSelectedCategory("");
      setPrice("");
      setSelectedFiles([]);
      setVisibility("public");
      setVisibilityType("free");
      setScheduleRelease(false);
      setReleaseDate(undefined);
      // Close dialog or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/artist-dashboard?tab=artworks");
      }
    }
    setIsUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10">
        {/* Portfolio Limit Banner */}
        <FeatureLimitBanner type="portfolio" onUpgrade={handleUpgrade} />

        {/* Limit Reached Warning */}
        {!canUploadPortfolio && (
          <Card className="border-orange-200/50 bg-orange-50/50 dark:bg-orange-500/5 backdrop-blur-sm rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-500/20 text-orange-600">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-black text-orange-800 dark:text-orange-400 uppercase tracking-tight">Portfolio limit reached</p>
                  <p className="text-xs sm:text-sm text-orange-600/80 font-medium leading-relaxed">
                    You've uploaded {portfolioCount}/{portfolioLimit} items. Upgrade to Pro for unlimited creative freedom!
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleUpgrade}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-black shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 overflow-hidden">
          <CardHeader className="bg-muted/30 px-5 py-4 sm:px-8 sm:py-6">
            <CardTitle className="flex items-center justify-between text-lg sm:text-xl font-black tracking-tight">
              <span className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Content Type
              </span>
              {!isProArtist && (
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted px-2.5 py-1 rounded-full border border-border/40">
                  {portfolioCount}/{portfolioLimit} items
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm font-medium opacity-70">Select the type of content you want to upload</CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                const isActive = selectedType === type.id;
                return (
                  <div 
                    key={type.id}
                    className={cn(
                      "group relative border-2 rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-300",
                      isActive 
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                        : "border-border/40 hover:border-primary/40 hover:bg-primary/5"
                    )}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className={cn(
                      "mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3 rounded-xl flex items-center justify-center transition-all duration-300",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <p className={cn(
                      "text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>{type.label}</p>
                    {isActive && (
                      <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5">
          <CardHeader className="bg-muted/30 px-5 py-4 sm:px-8 sm:py-6">
            <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-black tracking-tight">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Artwork Details
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm font-medium opacity-70">Provide essential information about your artwork</CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-8 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-2.5 sm:space-y-3">
                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Artwork Title*</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Celestial Dream"
                  className="h-12 rounded-xl bg-muted/20 border-border/40 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm sm:text-base"
                  required
                />
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Primary Category*</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category" className="h-12 rounded-xl bg-muted/20 border-border/40 focus:ring-primary/20 focus:border-primary font-medium text-sm sm:text-base">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="font-medium rounded-lg m-1 text-sm sm:text-base">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2.5 sm:space-y-3">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Project Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Describe the story, inspiration, or process behind this piece..."
                className="min-h-[120px] rounded-2xl bg-muted/20 border-border/40 focus:ring-primary/20 focus:border-primary transition-all font-medium leading-relaxed text-sm sm:text-base"
                rows={4}
              />
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="upload" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                Upload {selectedType === "image" ? "Images" : selectedType === "audio" ? "Audio Files" : "Videos"}*
              </Label>
              <div className="group relative border-2 border-dashed border-border/60 rounded-[2rem] p-5 sm:p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 ease-out overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <Input 
                  id="upload" 
                  type="file" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  multiple={selectedType === "image"}
                  accept={
                    selectedType === "image" ? "image/*" : 
                    selectedType === "audio" ? "audio/*" : 
                    "video/*"
                  }
                />
                <Label htmlFor="upload" className="cursor-pointer block relative z-10">
                  <div className="mx-auto flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] bg-primary/10 text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    {selectedType === "image" && <ImageIcon className="h-7 w-7 sm:h-10 sm:w-10" />}
                    {selectedType === "audio" && <MusicIcon className="h-7 w-7 sm:h-10 sm:w-10" />}
                    {selectedType === "video" && <VideoIcon className="h-7 w-7 sm:h-10 sm:w-10" />}
                  </div>
                  {selectedFiles.length === 0 ? (
                    <div className="space-y-1.5 sm:space-y-2">
                      <p className="text-base sm:text-xl font-black tracking-tight text-foreground">Click to upload <span className="text-primary">or drag & drop</span></p>
                      <p className="text-[10px] sm:text-sm text-muted-foreground font-medium opacity-60">High resolution files supported</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-primary text-primary-foreground font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                        {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
                      </div>
                      <p className="text-[9px] sm:text-xs text-muted-foreground font-medium max-w-md mx-auto truncate px-4 italic opacity-80">
                        {selectedFiles.map(f => f.name).join(", ")}
                      </p>
                    </div>
                  )}
                </Label>
              </div>
              
              
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5">
          <CardHeader className="bg-muted/30 px-5 py-4 sm:px-8 sm:py-6">
            <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-black tracking-tight">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Visibility & Monetization
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm font-medium opacity-70">Define access rights and pricing strategy</CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-8 space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Discovery Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/40 focus:ring-primary/20 focus:border-primary font-medium text-sm sm:text-base">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                  {visibilityOptions.map(option => (
                    <SelectItem key={option.id} value={option.id} className="font-medium rounded-lg m-1 text-sm sm:text-base">{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Access Tier & Pricing</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { id: "free", label: "Free", desc: "Open to the world" },
                  { id: "premium", label: "Premium", desc: "One-time purchase" },
                  { id: "exclusive", label: "Exclusive", desc: "Collector's only" }
                ].map((tier) => (
                  <div 
                    key={tier.id}
                    className={cn(
                      "relative border-2 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300 group",
                      visibilityType === tier.id 
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                        : "border-border/40 hover:border-primary/40 hover:bg-primary/5"
                    )}
                    onClick={() => setVisibilityType(tier.id)}
                  >
                    <p className={cn(
                      "text-sm sm:text-base font-black uppercase tracking-tight mb-0.5 sm:mb-1 transition-colors",
                      visibilityType === tier.id ? "text-primary" : "text-foreground"
                    )}>{tier.label}</p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium opacity-70 leading-tight">{tier.desc}</p>
                    {visibilityType === tier.id && (
                      <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {(visibilityType === "premium" || visibilityType === "exclusive") && (
              <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 rounded-[2rem] bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-500">
                <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-primary/80 ml-1">Set Your Price ({userCurrency})*</Label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-base sm:text-lg">{userCurrencySymbol}</span>
                  <Input 
                    id="price" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-12 sm:h-14 pl-10 sm:pl-12 rounded-xl bg-background border-primary/20 focus:ring-primary/20 focus:border-primary transition-all font-black text-base sm:text-lg"
                  />
                </div>
                <div className="flex items-start gap-2 text-[10px] sm:text-xs text-muted-foreground/60 font-medium leading-relaxed italic">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-50" />
                  <p>
                    {userCurrency === 'INR' 
                      ? 'Transactions for Indian artists are processed in INR for optimal local settlement.' 
                      : 'Global pricing will be automatically adjusted based on the buyer\'s preferred currency.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 sm:p-6 rounded-2xl border border-border/40 bg-muted/10 group hover:border-primary/20 transition-all duration-300">
              <div className="space-y-0.5 sm:space-y-1">
                <Label htmlFor="schedule" className="font-black text-xs sm:text-sm uppercase tracking-tight group-hover:text-primary transition-colors cursor-pointer">Schedule Release</Label>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium opacity-60">Set a future date for this content to go live</p>
              </div>
              <Switch id="schedule" checked={scheduleRelease} onCheckedChange={setScheduleRelease} className="data-[state=checked]:bg-primary" />
            </div>

            {scheduleRelease && (
              <div className="space-y-2.5 sm:space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Launch Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 w-full justify-start text-left font-medium rounded-xl border-border/40 bg-muted/20 hover:bg-muted/30 transition-all text-sm sm:text-base">
                      <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                      {releaseDate ? format(releaseDate, "PPP") : <span className="opacity-50">Pick a future date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-border/40 shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={releaseDate}
                      onSelect={setReleaseDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="rounded-2xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 px-2 sm:px-0">
          <Button 
            type="submit" 
            disabled={isUploading}
            className="w-full sm:flex-1 h-12 sm:h-14 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isUploading ? (
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Publish Artwork</span>
                <Plus className="h-5 w-5" />
              </div>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            disabled={isUploading}
            className="w-full sm:w-auto h-12 sm:h-14 px-10 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            Cancel
          </Button>

        </div>
      </form>

      <AlertDialog open={showAiConfirm} onOpenChange={setShowAiConfirm}>
        <AlertDialogContent className="rounded-3xl border-border/40 shadow-2xl max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              AI Content Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium leading-relaxed">
              Some files have been flagged as potential AI-generated content. While allowed, this may affect content visibility and discovery in certain regions.
              <br /><br />
              Do you want to proceed with the upload anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="h-12 rounded-xl font-bold border-border/40 hover:bg-muted/50 transition-all">
              Cancel Upload
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowAiConfirm(false);
                setAiConfirmed(true);
                // Trigger submit again with confirmation state
                setTimeout(() => {
                  const form = document.querySelector('form');
                  if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }, 100);
              }}
              className="h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-600/20 transition-all"
            >
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArtworkUploadForm;
