
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Save, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ArtworkEditModalProps {
  artwork: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedArtwork: any) => void;
}

const ArtworkEditModal = ({ artwork, isOpen, onClose, onSave }: ArtworkEditModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    is_for_sale: false,
    is_pinned: false,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (artwork) {
      setFormData({
        title: artwork.title || "",
        description: artwork.description || "",
        price: artwork.price?.toString() || "",
        category: artwork.category || "",
        is_for_sale: artwork.is_for_sale || false,
        is_pinned: artwork.is_pinned || false,
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

  const handleSave = () => {
    const updatedArtwork = {
      ...artwork,
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null
    };

    onSave(updatedArtwork);
    toast({
      title: "Artwork updated",
      description: "Your artwork has been updated successfully."
    });
    onClose();
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
            <DollarSign className="h-5 w-5" />
            Edit Artwork
          </DialogTitle>
          <DialogDescription>
            Update your artwork details, pricing, and availability
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artwork Preview */}
          <div className="flex gap-4">
            <img
              src={artwork?.imageUrl}
              alt={artwork?.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{artwork?.title}</h3>
              <p className="text-sm text-muted-foreground">Current Status: {artwork?.approval_status}</p>
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

          {/* Pricing and Sale Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_for_sale">Available for Sale</Label>
              <Switch
                id="is_for_sale"
                checked={formData.is_for_sale}
                onCheckedChange={(checked) => handleInputChange('is_for_sale', checked)}
              />
            </div>

            {formData.is_for_sale && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="is_pinned">Pin to Profile</Label>
              <Switch
                id="is_pinned"
                checked={formData.is_pinned}
                onCheckedChange={(checked) => handleInputChange('is_pinned', checked)}
              />
            </div>
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
                    className="hover:text-red-500"
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
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkEditModal;
