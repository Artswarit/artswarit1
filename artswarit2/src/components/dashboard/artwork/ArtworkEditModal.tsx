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

  const handleSave = async () => {
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
    "Portrait", "Music Video", "Contemporary", "Traditional", "Photography"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Edit Artwork
          </DialogTitle>
          <DialogDescription>
            Update your artwork details, visibility, and pricing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artwork Preview */}
          <div className="flex gap-4">
            <img
              src={artwork?.imageUrl || artwork?.media_url}
              alt={artwork?.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{artwork?.title}</h3>
              <p className="text-sm text-muted-foreground">Current Status: {artwork?.status || artwork?.approval_status}</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Artwork title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your artwork..."
              rows={3}
            />
          </div>

          {/* Visibility & Pricing Section */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <div>
              <h3 className="font-semibold text-foreground">Visibility & Pricing</h3>
              <p className="text-sm text-muted-foreground">Set who can see your artwork and how they can access it</p>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Access Type */}
            <div className="space-y-2">
              <Label>Access Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                    formData.accessType === "free" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => handleInputChange('accessType', 'free')}
                >
                  <p className="font-medium text-sm">Free</p>
                  <p className="text-xs text-muted-foreground mt-1">Available to everyone at no cost</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                    formData.accessType === "premium" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => handleInputChange('accessType', 'premium')}
                >
                  <p className="font-medium text-sm">Premium</p>
                  <p className="text-xs text-muted-foreground mt-1">Paid access to this content only</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                    formData.accessType === "exclusive" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => handleInputChange('accessType', 'exclusive')}
                >
                  <p className="font-medium text-sm">Exclusive</p>
                  <p className="text-xs text-muted-foreground mt-1">Special collectors-only content</p>
                </div>
              </div>
            </div>

            {/* Price field - only show for premium/exclusive */}
            {(formData.accessType === "premium" || formData.accessType === "exclusive") && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)*</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Enter price in USD"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">Enter price in USD. It will be displayed in user's preferred currency.</p>
              </div>
            )}

            {/* Schedule for future release */}
            <div className="flex items-center justify-between">
              <Label htmlFor="schedule">Schedule for future release</Label>
              <Switch
                id="schedule"
                checked={formData.scheduleRelease}
                onCheckedChange={(checked) => handleInputChange('scheduleRelease', checked)}
              />
            </div>
          </div>

          {/* Pin to Profile */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div>
              <Label htmlFor="is_pinned" className="font-medium">Pin to Profile</Label>
              <p className="text-xs text-muted-foreground">Pinned artworks appear first on your profile</p>
            </div>
            <Switch
              id="is_pinned"
              checked={formData.is_pinned}
              onCheckedChange={(checked) => handleInputChange('is_pinned', checked)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkEditModal;
