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
import { format } from "date-fns";
import { Calendar as CalendarIcon, ImageIcon, MusicIcon, VideoIcon, FileTextIcon, AlertTriangle, Crown, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import AIContentDetection from "@/components/dashboard/AIContentDetection";
import { FeatureLimitBanner } from "@/components/premium/FeatureLimitBanner";

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
  onCancel?: () => void;
  onSuccess?: () => void;
}

const ArtworkUploadForm = ({ onCancel, onSuccess }: ArtworkUploadFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadArtwork } = useArtworks();
  const { canUploadPortfolio, portfolioCount, portfolioLimit, isProArtist } = useFeatureGating(user?.id);
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

  const handleUpgrade = () => {
    window.location.href = '/artist-dashboard?tab=premium';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setSelectedFiles(fileArray);
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

    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    if (visibilityType !== "free" && !price) {
      toast({
        title: "Error",
        description: "Please enter a price for your premium/exclusive content.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

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

    // Create artwork data object
    const artworkData = {
      title: title.trim(),
      description: description.trim(),
      category: selectedType,
      media_type: selectedType,
      file: selectedFiles[0], // Use first selected file
      price: visibilityType !== "free" ? price : null,
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
      // Reset form
      setTitle("");
      setDescription("");
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
        navigate("/artist-dashboard");
      }
    }
    setIsUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Portfolio Limit Banner */}
        <FeatureLimitBanner type="portfolio" onUpgrade={handleUpgrade} />

        {/* Limit Reached Warning */}
        {!canUploadPortfolio && (
          <Card className="border-orange-300 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-700">Portfolio limit reached</p>
                  <p className="text-sm text-orange-600">
                    You've uploaded {portfolioCount}/{portfolioLimit} items. Upgrade to Pro for unlimited portfolio space!
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleUpgrade}
                  className="ml-auto bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Content Type</span>
              {!isProArtist && (
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {portfolioCount}/{portfolioLimit} items
                </span>
              )}
            </CardTitle>
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
              <Label htmlFor="title">Title*</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter artwork title"
                required
              />
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
              <Label htmlFor="upload">Upload {selectedType === "image" ? "Images" : selectedType === "audio" ? "Audio Files" : selectedType === "video" ? "Videos" : "Documents"}*</Label>
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
                    </div>
                  ) : (
                    <div>
                      <p className="text-primary font-medium">Files selected: {selectedFiles.length}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedFiles.map(f => f.name).join(", ")}</p>
                    </div>
                  )}
                </Label>
              </div>
              
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
                <Label htmlFor="price">Price (USD)*</Label>
                <Input 
                  id="price" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="Enter price in USD"
                  type="number"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">Enter price in USD. It will be displayed in user's preferred currency.</p>
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
            onClick={() => onCancel ? onCancel() : navigate("/artist-dashboard")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isUploading || !canUploadPortfolio}
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
