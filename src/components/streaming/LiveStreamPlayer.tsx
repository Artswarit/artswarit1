
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Users, Heart, MessageSquare } from 'lucide-react';

interface LiveStreamPlayerProps {
  streamId: string;
  title: string;
  artist: string;
  isLive: boolean;
  viewerCount: number;
  onLike?: () => void;
  onComment?: (comment: string) => void;
}

const LiveStreamPlayer = ({ 
  streamId, 
  title, 
  artist, 
  isLive, 
  viewerCount,
  onLike,
  onComment 
}: LiveStreamPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [comment, setComment] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const submitComment = () => {
    if (comment.trim() && onComment) {
      onComment(comment);
      setComment('');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">by {artist}</p>
            </div>
            <div className="flex items-center gap-2">
              {isLive && <Badge className="bg-red-500">🔴 LIVE</Badge>}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{viewerCount}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              poster="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            >
              <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <div className="flex items-center gap-2 flex-1">
                  <Volume2 className="h-4 w-4 text-white" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLike}
                  className="text-white hover:bg-white/20"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Live Chat */}
          {isLive && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Join the conversation..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && submitComment()}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={submitComment} size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveStreamPlayer;
