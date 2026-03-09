
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface DetectionResult {
  isAiGenerated: boolean;
  confidence: number;
  flagged: boolean;
  details?: any;
  error?: string;
}

interface AIContentDetectionProps {
  fileUrl: string;
  contentType: 'image' | 'video' | 'audio' | 'text';
  onDetectionComplete?: (result: DetectionResult) => void;
  autoDetect?: boolean;
}

const AIContentDetection = ({ 
  fileUrl, 
  contentType, 
  onDetectionComplete,
  autoDetect = false 
}: AIContentDetectionProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { toast } = useToast();

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-detection', {
        body: {
          fileUrl,
          contentType
        }
      });

      if (error) {
        throw error;
      }

      setResult(data);
      onDetectionComplete?.(data);

      if (data.flagged) {
        toast({
          title: "AI Content Detected",
          description: `This ${contentType} appears to be AI-generated with ${Math.round(data.confidence * 100)}% confidence.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Content analysis finished. ${data.isAiGenerated ? 'Possible AI content detected.' : 'No AI generation detected.'}`,
        });
      }
    } catch (error) {
      console.error('AI detection error:', error);
      const errorResult = {
        isAiGenerated: false,
        confidence: 0,
        flagged: false,
        error: error.message
      };
      setResult(errorResult);
      onDetectionComplete?.(errorResult);
      
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze content for AI generation.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-detect on mount if enabled
  useState(() => {
    if (autoDetect && fileUrl) {
      analyzeContent();
    }
  });

  const getStatusIcon = () => {
    if (isAnalyzing) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!result) return <Shield className="h-4 w-4" />;
    if (result.flagged) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusColor = () => {
    if (!result || result.error) return "secondary";
    if (result.flagged) return "destructive";
    if (result.isAiGenerated) return "warning";
    return "success";
  };

  const getStatusText = () => {
    if (isAnalyzing) return "Analyzing...";
    if (!result) return "Not analyzed";
    if (result.error) return "Analysis failed";
    if (result.flagged) return "AI Generated (Flagged)";
    if (result.isAiGenerated) return "Possibly AI Generated";
    return "Human Created";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          AI Content Detection
        </CardTitle>
        <CardDescription>
          Analyze {contentType} content for AI generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
            {getStatusText()}
          </Badge>
          {result && result.confidence > 0 && (
            <span className="text-sm text-muted-foreground">
              {Math.round(result.confidence * 100)}% confidence
            </span>
          )}
        </div>

        {!autoDetect && (
          <Button 
            onClick={analyzeContent} 
            disabled={isAnalyzing || !fileUrl}
            className="w-full"
            variant="outline"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Content...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Analyze for AI Content
              </>
            )}
          </Button>
        )}

        {result && result.error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            Error: {result.error}
          </div>
        )}

        {result && result.flagged && (
          <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
            <strong>Warning:</strong> This content has been flagged as likely AI-generated. 
            Please review before publishing.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIContentDetection;
