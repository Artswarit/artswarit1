
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, CheckCircle } from 'lucide-react';
import { useArtworks } from '@/hooks/useArtworks';
import { useToast } from '@/hooks/use-toast';

interface ArtworkUploadProps {
  onClose?: () => void;
  onUploadSuccess?: () => void;
}

const categories = [
  'Digital Art',
  'Photography',
  'Painting',
  'Illustration',
  'Sculpture',
  'Mixed Media',
  'Abstract',
  'Portrait',
  'Landscape',
  'Street Art',
  'Music',
  'Audio',
  'Video',
  'Film',
  'Writing',
  'Literature',
  'Poetry'
];

const ArtworkUpload = ({ onClose, onUploadSuccess }: ArtworkUploadProps) => {
  const { uploadArtwork } = useArtworks();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    price: '',
    is_for_sale: false,
    is_pinned: false,
    release_date: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!selectedFile) {
      newErrors.file = 'Please select an artwork file';
    }
    
    if (formData.is_for_sale && !formData.price) {
      newErrors.price = 'Price is required for items marked for sale';
    }
    
    if (formData.price && isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Please enter a valid price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
        'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
        'text/plain', 'application/pdf', 'text/html'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image, video, audio, or text file.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Clear file error if it exists
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    try {
      const result = await uploadArtwork({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: tagsArray,
        price: formData.price ? parseFloat(formData.price) : undefined,
        is_for_sale: formData.is_for_sale,
        is_pinned: formData.is_pinned,
        release_date: formData.release_date || undefined,
        file: selectedFile,
      });

      if (!result?.error) {
        setUploadSuccess(true);
        toast({
          title: "Success!",
          description: "Your artwork has been uploaded and is now visible on the explore page and your profile!"
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          tags: '',
          price: '',
          is_for_sale: false,
          is_pinned: false,
          release_date: '',
        });
        handleRemoveFile();
        
        // Call success callback and close after a delay
        setTimeout(() => {
          onUploadSuccess?.();
          onClose?.();
        }, 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload artwork. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Upload Successful!</h3>
          <p className="text-muted-foreground text-center">
            Your artwork has been uploaded and is now visible on the explore page and your profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Upload New Artwork
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Artwork File *</Label>
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="file" className="cursor-pointer">
                    <span className="text-primary hover:text-primary/90">Upload a file</span>
                    <input
                      id="file"
                      type="file"
                      className="sr-only"
                      accept="image/*,video/*,audio/*,.txt,.pdf"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Images, Videos, Audio, or Text files up to 50MB</p>
              </div>
            ) : (
              <div className="relative">
                {selectedFile.type.startsWith('image/') && (
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                {(selectedFile.type.startsWith('video/') || selectedFile.type.startsWith('audio/') || selectedFile.type.startsWith('text/')) && (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter artwork title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your artwork"
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas (e.g., abstract, colorful, modern)"
            />
            <p className="text-xs text-gray-500">Separate multiple tags with commas</p>
          </div>

          {/* Price and For Sale */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_for_sale"
                checked={formData.is_for_sale}
                onCheckedChange={(checked) => handleInputChange('is_for_sale', !!checked)}
              />
              <Label htmlFor="is_for_sale">For Sale</Label>
            </div>
            {formData.is_for_sale && (
              <div className="flex-1">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Price ($)"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              </div>
            )}
          </div>

          {/* Pin Artwork */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_pinned"
              checked={formData.is_pinned}
              onCheckedChange={(checked) => handleInputChange('is_pinned', !!checked)}
            />
            <Label htmlFor="is_pinned">Pin to top of profile</Label>
          </div>

          {/* Release Date */}
          <div className="space-y-2">
            <Label htmlFor="release_date">Release Date (Optional)</Label>
            <Input
              id="release_date"
              type="datetime-local"
              value={formData.release_date}
              onChange={(e) => handleInputChange('release_date', e.target.value)}
            />
            <p className="text-xs text-gray-500">Leave empty to publish immediately</p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Artwork'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ArtworkUpload;
