
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ImageIcon, MusicIcon, VideoIcon, FileTextIcon, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import AIContentDetection from "@/components/dashboard/AIContentDetection";

const contentTypes = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "audio", label: "Audio", icon: MusicIcon },
  { id: "video", label: "Video", icon: VideoIcon },
  { id: "text", label: "Text", icon: FileTextIcon },
];

const visibilityOptions = [
  { id: "public", label: "Public - Visible to everyone" },
  { id: "private", label: "Private - Only visible to you" },
  { id: "followers", label: "Followers Only - Visible to your followers" },
];

interface ArtworkUploadFormProps {
  onSuccess?: () => void;
  uploadArtwork?: (artworkData: any) => Promise<{ error: any; artwork?: any }>;
}

const ArtworkUploadForm = ({ onSuccess, uploadArtwork }: ArtworkUploadFormProps = {}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState("image");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [visibilityType, setVisibilityType] = useState("free");
  const [scheduleRelease, setScheduleRelease] = useState(false);
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(undefined);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any[]>([]);
  const [hasAiContent, setHasAiContent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (selectedFiles.length === 0) {
      newErrors.files = 'Please select at least one file';
    }
    
    if (visibilityType !== "free" && !price) {
      newErrors.price = 'Price is required for premium/exclusive content';
    }
    
    if (price && isNaN(parseFloat(price))) {
      newErrors.price = 'Please enter a valid price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      
      // Validate file types and sizes
      const invalidFiles = fileArray.filter(file => {
        const maxSize = 50 * 1024 * 1024; // 50MB
        return file.size > maxSize;
      });
      
      if (invalidFiles.length > 0) {
        toast({
          title: "File too large",
          description: `Some files exceed the 50MB limit. Please select smaller files.`,
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFiles(fileArray);
      setDetectionResults([]);
      setHasAiContent(false);
      
      // Clear file error
      if (errors.files) {
        setErrors(prev => ({ ...prev, files: '' }));
      }
    }
  };

  const handleDetectionComplete = (result: any, fileIndex: number) => {
    const newResults = [...detectionResults];
    newResults[fileIndex] = result;
    setDetectionResults(newResults);
    
    // Check if any file is flagged as AI content
    const hasAi = newResults.some(r => r && r.flagged);
    setHasAiContent(hasAi);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Additional validation for AI content
    if (hasAiContent) {
      const proceed = window.confirm(
        "Some files have been flagged as AI-generated content. Do you want to proceed anyway? This may affect content visibility."
      );
      if (!proceed) {
        setIsUploading(false);
        return;
      }
    }

    try {
      if (uploadArtwork) {
        const artworkData = {
          title,
          description,
          category: selectedType,
          price: price ? parseFloat(price) : null,
          is_for_sale: visibilityType !== "free",
          file: selectedFiles[0],
          tags: [],
          release_date: scheduleRelease ? releaseDate : null
        };

        const result = await uploadArtwork(artworkData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Clear form
        setTitle("");
        setDescription("");
        setPrice("");
        setSelectedFiles([]);
        setDetectionResults([]);
        setHasAiContent(false);
        setErrors({});
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/artist-dashboard");
        }
      } else {
        // Fallback to mock upload
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        toast({
          title: "Success",
          description: "Your artwork has been uploaded successfully!",
        });
        
        // Clear form
        setTitle("");
        setDescription("");
        setPrice("");
        setSelectedFiles([]);
        setDetectionResults([]);
        setHasAiContent(false);
        setErrors({});
        
        navigate("/artist-dashboard");
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload artwork. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Content Type</CardTitle>
            <CardDescription>Select the type of content you want to upload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div 
                    key={type.id}
                    className={`border rounded-lg p-4 text-center cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                      selectedType === type.id ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <Icon className="mx-auto h-8 w-8 mb-2" />
                    <p>{type.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artwork Details</CardTitle>
            <CardDescription>Provide information about your artwork</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => {
                  setTitle(e.target.value);
                  handleInputChange('title', e.target.value);
                }} 
                placeholder="Enter artwork title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Tell us about your artwork"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="upload">Upload {selectedType === "image" ? "Images" : selectedType === "audio" ? "Audio Files" : selectedType === "video" ? "Videos" : "Documents"} *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <Input 
                  id="upload" 
                  type="file" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  multiple={selectedType === "image"}
                  accept={
                    selectedType === "image" ? "image/*" : 
                    selectedType === "audio" ? "audio/*" : 
                    selectedType === "video" ? "video/*" : 
                    ".pdf,.doc,.docx,.txt"
                  }
                />
                <Label htmlFor="upload" className="cursor-pointer block">
                  <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    {selectedType === "image" && <ImageIcon className="text-primary" />}
                    {selectedType === "audio" && <MusicIcon className="text-primary" />}
                    {selectedType === "video" && <VideoIcon className="text-primary" />}
                    {selectedType === "text" && <FileTextIcon className="text-primary" />}
                  </div>
                  {selectedFiles.length === 0 ? (
                    <div>
                      <p className="text-primary font-medium">Click to upload</p>
                      <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-2">Max file size: 50MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-primary font-medium">Files selected: {selectedFiles.length}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedFiles.map(f => f.name).join(", ")}</p>
                    </div>
                  )}
                </Label>
              </div>
              {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
              
              {/* AI Content Detection for uploaded files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-4 mt-4">
                  <h4 className="font-medium text-sm">AI Content Analysis</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <AIContentDetection
                        fileUrl={URL.createObjectURL(file)}
                        contentType={selectedType as any}
                        onDetectionComplete={(result) => handleDetectionComplete(result, index)}
                        autoDetect={true}
                      />
                    </div>
                  ))}
                  
                  {hasAiContent && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">AI Content Detected</span>
                      </div>
                      <p className="text-sm text-amber-700 mt-1">
                        Some of your files have been flagged as potentially AI-generated. 
                        You can still upload them, but they may be subject to additional review.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibility & Pricing</CardTitle>
            <CardDescription>Set who can see your artwork and how they can access it</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
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

            <div className="space-y-2">
              <Label>Access Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                    visibilityType === "free" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}
                  onClick={() => setVisibilityType("free")}
                >
                  <p className="font-medium">Free</p>
                  <p className="text-sm text-gray-500 mt-1">Available to everyone at no cost</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                    visibilityType === "premium" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}
                  onClick={() => setVisibilityType("premium")}
                >
                  <p className="font-medium">Premium</p>
                  <p className="text-sm text-gray-500 mt-1">Paid access to this content only</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                    visibilityType === "exclusive" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}
                  onClick={() => setVisibilityType("exclusive")}
                >
                  <p className="font-medium">Exclusive</p>
                  <p className="text-sm text-gray-500 mt-1">Special collectors-only content</p>
                </div>
              </div>
            </div>

            {(visibilityType === "premium" || visibilityType === "exclusive") && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input 
                  id="price" 
                  value={price} 
                  onChange={(e) => {
                    setPrice(e.target.value);
                    handleInputChange('price', e.target.value);
                  }} 
                  placeholder="Enter price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch id="schedule" checked={scheduleRelease} onCheckedChange={setScheduleRelease} />
              <Label htmlFor="schedule">Schedule for future release</Label>
            </div>

            {scheduleRelease && (
              <div className="space-y-2">
                <Label>Release Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {releaseDate ? format(releaseDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={releaseDate}
                      onSelect={setReleaseDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/artist-dashboard")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isUploading}
            className="bg-gradient-to-r from-artswarit-purple to-blue-500 border-none"
          >
            {isUploading ? "Uploading..." : "Upload Artwork"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArtworkUploadForm;
