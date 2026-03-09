
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AIContentDetection from "@/components/dashboard/AIContentDetection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AIDetection = () => {
  const [fileUrl, setFileUrl] = useState("");
  const [contentType, setContentType] = useState<'image' | 'video' | 'audio' | 'text'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">AI Content Detection</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload or provide a URL to analyze content for AI generation. Our advanced AI detection 
              system can identify AI-generated images, videos, audio, and text with high accuracy.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Content for Analysis</CardTitle>
              <CardDescription>
                Select the type of content and upload a file or provide a URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileSelect}
                    accept={
                      contentType === 'image' ? 'image/*' :
                      contentType === 'video' ? 'video/*' :
                      contentType === 'audio' ? 'audio/*' :
                      '.txt,.pdf,.doc,.docx'
                    }
                  />
                </div>

                <div className="text-center text-muted-foreground">or</div>

                <div className="space-y-2">
                  <Label htmlFor="url-input">Content URL</Label>
                  <Input
                    id="url-input"
                    placeholder="https://example.com/content.jpg"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                </div>
              </div>

              {fileUrl && (
                <div className="border-t pt-6">
                  <AIContentDetection
                    fileUrl={fileUrl}
                    contentType={contentType}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AIDetection;
