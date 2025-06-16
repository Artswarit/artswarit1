
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, Users, Settings, Maximize } from 'lucide-react';

interface LiveStreamPlayerProps {
  streamId: string;
  title: string;
  artist: string;
  isLive: boolean;
  viewerCount: number;
  onLike: () => void;
  onComment: (comment: string) => void;
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
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, user: 'ArtLover123', message: 'Amazing work!', time: '2m ago' },
    { id: 2, user: 'CreativeSpirit', message: 'Love the technique', time: '5m ago' },
    { id: 3, user: 'DigitalArtist', message: 'What brush are you using?', time: '7m ago' }
  ]);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLike = () => {
    setLiked(!liked);
    onLike();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        id: comments.length + 1,
        user: 'You',
        message: comment,
        time: 'now'
      };
      setComments([newComment, ...comments]);
      onComment(comment);
      setComment('');
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Player */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-0">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop"
                autoPlay
                muted
              >
                <source src="https://example.com/stream.m3u8" type="application/x-mpegURL" />
                Your browser does not support the video tag.
              </video>
              
              {/* Live indicator */}
              {isLive && (
                <Badge className="absolute top-4 left-4 bg-red-500">
                  🔴 LIVE
                </Badge>
              )}
              
              {/* Viewer count */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="text-sm">{viewerCount}</span>
              </div>
              
              {/* Controls overlay */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={toggleFullscreen}>
                  <Maximize className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Stream info */}
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{title}</h2>
              <p className="text-muted-foreground mb-4">by {artist}</p>
              
              {/* Action buttons */}
              <div className="flex items-center gap-4">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Liked' : 'Like'}
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  Follow Artist
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Chat/Comments */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardContent className="p-4 h-full flex flex-col">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Live Chat ({comments.length})
            </h3>
            
            {/* Comments list */}
            <div className="flex-1 space-y-3 overflow-y-auto mb-4 max-h-96">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-purple-600">{comment.user}</span>
                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-gray-700">{comment.message}</p>
                </div>
              ))}
            </div>
            
            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveStreamPlayer;
