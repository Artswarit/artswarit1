import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Save, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ArtworkEditModalProps {
  artwork: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedArtwork: any) => void;
}

const visibilityOptions = [
  { id: "public", label: "Public - Visible to everyone" },
  { id: "private", label: "Private - Only visible to you" },
  { id: "followers", label: "Followers Only - Visible to your followers" },
];

const ArtworkEditModal = ({ artwork, isOpen, onClose, onSave }: ArtworkEditModalProps) => {
  const { toast } = useToast();
  const { userCurrency, userCurrencySymbol } = useCurrency();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    visibility: "public",
    accessType: "free",
    is_pinned: false,
    scheduleRelease: false,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (artwork) {
      const metadata = artwork.metadata || {};
      setFormData({
        title: artwork.title || "",
        description: artwork.description || "",
        price: artwork.price?.toString() || "",
        category: artwork.category || "",
        visibility: metadata.visibility || "public",
        accessType: metadata.access_type || "free",
        is_pinned: metadata.is_pinned || artwork.is_pinned || false,
        scheduleRelease: metadata.schedule_release || false,
        tags: artwork.tags || []
      });
    }
  }, [artwork]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!artwork?.id) return;
    
    setSaving(true);
    try {
      // For Free access type, price should be null/0
      let priceValue = null;
      if (formData.accessType !== "free" && formData.price) {
        priceValue = parseFloat(formData.price);
      }
      
      const updatedMetadata = {
        ...(artwork.metadata || {}),
        is_pinned: formData.is_pinned,
        visibility: formData.visibility,
        access_type: formData.accessType,
        schedule_release: formData.scheduleRelease,
        currency: userCurrency,
        likes_count: (artwork.metadata as any)?.likes_count || 0,
        views_count: (artwork.metadata as any)?.views_count || 0
      };

      const { error } = await supabase
        .from('artworks')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: priceValue,
          tags: formData.tags,
          metadata: updatedMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', artwork.id);

      if (error) throw error;

      const updatedArtwork = {
        ...artwork,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: priceValue,
        tags: formData.tags,
        metadata: updatedMetadata,
        is_pinned: formData.is_pinned
      };

      onSave(updatedArtwork);
      toast({
        title: "Artwork updated",
        description: "Your artwork has been updated successfully."
      });
      onClose();
    } catch (err: any) {
      console.error('Error updating artwork:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update artwork",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    "Digital Art", "Music", "Hip-Hop", "Abstract Art", "Landscape", 
    "Portrait", "Music Video", "Contemporary", "Traditional", "Photography",
    "Musicians", "Writers", "Rappers", "Editors", "Scriptwriters", 
    "Photographers", "Illustrators", "Voice Artists", "Animators", 
    "UI/UX Designers", "Singers", "Dancers"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-[2.5rem] border-primary/10 shadow-2xl backdrop-blur-xl bg-background/95 p-0">
        <DialogHeader className="p-6 sm:p-8 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight">
                Edit Artwork
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground/80 mt-1">
                Update your artwork details, visibility, and pricing
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Artwork Preview */}
          <div className="flex gap-5 p-4 bg-muted/30 rounded-3xl border border-primary/5 shadow-inner">
            <div className="relative group shrink-0">
              <img
                src={artwork?.imageUrl || artwork?.media_url}
                alt={artwork?.title}
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl shadow-md transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 group-hover:ring-primary/20 transition-all" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <h3 className="text-lg font-black truncate text-foreground/90">{artwork?.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="px-3 py-1 rounded-full border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary">
                  {artwork?.status || artwork?.approval_status || 'Active'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="title" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Artwork title"
                className="h-14 rounded-2xl bg-muted/20 border-primary/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="category" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-primary/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-medium">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-primary/10 shadow-xl backdrop-blur-xl">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="min-h-[44px] rounded-xl focus:bg-primary/5">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <Label htmlFor="description" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your artwork..."
              rows={4}
              className="rounded-2xl bg-muted/20 border-primary/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-medium resize-none p-4"
            />
          </div>

          {/* Visibility & Pricing Section */}
          <div className="space-y-6 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 shadow-sm">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Visibility & Pricing</h3>
              <p className="text-xs font-medium text-muted-foreground mt-1">Set who can see your artwork and how they can access it</p>
            </div>

            {/* Visibility */}
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Visibility</Label>
              <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                <SelectTrigger className="h-14 rounded-2xl bg-background border-primary/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-medium">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-primary/10 shadow-xl backdrop-blur-xl">
                  {visibilityOptions.map(option => (
                    <SelectItem key={option.id} value={option.id} className="min-h-[44px] rounded-xl focus:bg-primary/5">{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Access Type */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Access Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  type="button"
                  className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all hover:-translate-y-1 active:scale-95 min-h-[100px] border-2 shadow-sm ${
                    formData.accessType === "free" ? "border-primary bg-primary/10 ring-4 ring-primary/5" : "border-background/50 bg-background hover:border-primary/30"
                  }`}
                  onClick={() => handleInputChange('accessType', 'free')}
                >
                  <p className="font-black text-sm uppercase tracking-tight">Free</p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-2 leading-relaxed">Available to everyone at no cost</p>
                  {formData.accessType === "free" && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </button>
                
                <button 
                  type="button"
                  className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all hover:-translate-y-1 active:scale-95 min-h-[100px] border-2 shadow-sm ${
                    formData.accessType === "premium" ? "border-primary bg-primary/10 ring-4 ring-primary/5" : "border-background/50 bg-background hover:border-primary/30"
                  }`}
                  onClick={() => handleInputChange('accessType', 'premium')}
                >
                  <p className="font-black text-sm uppercase tracking-tight">Premium</p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-2 leading-relaxed">Paid access to this content only</p>
                  {formData.accessType === "premium" && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </button>
                
                <button 
                  type="button"
                  className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all hover:-translate-y-1 active:scale-95 min-h-[100px] border-2 shadow-sm ${
                    formData.accessType === "exclusive" ? "border-primary bg-primary/10 ring-4 ring-primary/5" : "border-background/50 bg-background hover:border-primary/30"
                  }`}
                  onClick={() => handleInputChange('accessType', 'exclusive')}
                >
                  <p className="font-black text-sm uppercase tracking-tight">Exclusive</p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-2 leading-relaxed">Special collectors-only content</p>
                  {formData.accessType === "exclusive" && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </button>
              </div>
            </div>

            {/* Price field - only show for premium */}
            {formData.accessType === "premium" && (
              <div className="space-y-2.5 animate-in fade-in slide-in-from-top-4 duration-500">
                <Label htmlFor="price" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Price ({userCurrency === 'INR' ? 'INR' : 'USD'})*</Label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black text-lg group-focus-within:scale-110 transition-transform">{userCurrencySymbol}</span>
                  <Input
                    id="price"
                    type="number"
                    className="pl-12 h-14 rounded-2xl bg-background border-primary/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-black text-lg"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {/* Schedule for future release */}
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-primary/5 shadow-inner">
              <div className="space-y-0.5">
                <Label htmlFor="schedule" className="text-sm font-black uppercase tracking-tight cursor-pointer">Schedule for future release</Label>
                <p className="text-[10px] font-medium text-muted-foreground">Automatically publish at a later date</p>
              </div>
              <Switch
                id="schedule"
                checked={formData.scheduleRelease}
                onCheckedChange={(checked) => handleInputChange('scheduleRelease', checked)}
                className="data-[state=checked]:bg-primary scale-110"
              />
            </div>
          </div>

          {/* Pin to Profile */}
          <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[2rem] border border-primary/10 shadow-sm">
            <div className="space-y-1">
              <Label htmlFor="is_pinned" className="text-sm font-black uppercase tracking-widest cursor-pointer">Pin to Profile</Label>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Feature on your profile</p>
            </div>
            <Switch
              id="is_pinned"
              checked={formData.is_pinned}
              onCheckedChange={(checked) => handleInputChange('is_pinned', checked)}
              className="data-[state=checked]:bg-primary scale-125"
            />
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tags</Label>
            <div className="flex flex-wrap gap-3">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="pl-4 pr-1.5 py-1.5 flex items-center gap-2 rounded-2xl bg-background border border-primary/10 text-primary shadow-sm hover:border-primary/30 transition-all group">
                  <span className="text-xs font-black uppercase tracking-wider">{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:bg-destructive/10 hover:text-destructive p-1.5 rounded-xl transition-all flex items-center justify-center min-w-[44px] min-h-[44px] active:scale-90"
                    type="button"
                    aria-label={`Remove ${tag} tag`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-3">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="h-14 rounded-2xl bg-muted/20 border-primary/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} size="icon" className="h-14 w-14 rounded-2xl shrink-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
                <Plus className="h-7 w-7" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-primary/10">
            <Button variant="outline" onClick={onClose} disabled={saving} className="h-14 rounded-2xl sm:px-10 font-black uppercase tracking-widest text-xs border-primary/10 hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-95 order-2 sm:order-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="h-14 rounded-2xl sm:px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all gap-3 order-1 sm:order-2">
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkEditModal;
