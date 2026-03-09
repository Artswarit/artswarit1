import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveStreamPlayer from '@/components/streaming/LiveStreamPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Users, Calendar, Clock, Video, Mic, Settings, Share } from 'lucide-react';

const LiveStreaming = () => {
  const [activeStreams] = useState([
    {
      id: '1',
      title: 'Digital Art Creation Session',
      artist: 'Maya Johnson',
      isLive: true,
      viewerCount: 247,
      category: 'Digital Art',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop',
      startTime: '2 hours ago',
      streamUrl: 'https://example.com/stream1'
    },
    {
      id: '2',
      title: 'Music Production Workshop',
      artist: 'Alex Rivera',
      isLive: true,
      viewerCount: 156,
      category: 'Music',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
      startTime: '45 minutes ago',
      streamUrl: 'https://example.com/stream2'
    }
  ]);

  const [upcomingStreams] = useState([
    {
      id: '3',
      title: 'Street Art Documentary',
      artist: 'Jordan Smith',
      scheduledTime: 'Today 8:00 PM',
      category: 'Documentary',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'
    }
  ]);

  const [selectedStream, setSelectedStream] = useState(activeStreams[0]);

  const handleLike = () => {
    console.log('Liked stream');
  };

  const handleComment = (comment: string) => {
    console.log('New comment:', comment);
  };

  const startStream = () => {
    console.log('Starting stream...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Streaming</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Watch artists create in real-time and interact with the creative process
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Button onClick={startStream} className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Start Streaming
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Stream
              </Button>
            </div>
          </div>

          {/* Featured Live Stream */}
          {selectedStream && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">🔴 Live Now</h2>
              <div className="max-w-4xl mx-auto">
                <LiveStreamPlayer
                  streamId={selectedStream.id}
                  title={selectedStream.title}
                  artist={selectedStream.artist}
                  isLive={selectedStream.isLive}
                  viewerCount={selectedStream.viewerCount}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              </div>
            </div>
          )}

          {/* Stream Controls for Artists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Stream Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stream Title</label>
                  <Input placeholder="Enter stream title..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full p-2 border rounded">
                    <option>Digital Art</option>
                    <option>Music</option>
                    <option>Photography</option>
                    <option>Writing</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Privacy</label>
                  <select className="w-full p-2 border rounded">
                    <option>Public</option>
                    <option>Followers Only</option>
                    <option>Premium Only</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Button className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Go Live
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Audio Only
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Other Live Streams */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Other Live Streams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeStreams.slice(1).map((stream) => (
                <Card key={stream.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedStream(stream)}>
                  <div className="relative">
                    <img 
                      src={stream.thumbnail} 
                      alt={stream.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      🔴 LIVE
                    </Badge>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {stream.viewerCount}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{stream.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{stream.artist}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{stream.category}</Badge>
                      <span className="text-xs text-muted-foreground">{stream.startTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Streams */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Upcoming Streams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingStreams.map((stream) => (
                <Card key={stream.id} className="hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={stream.thumbnail} 
                      alt={stream.title}
                      className="w-full h-48 object-cover rounded-t-lg opacity-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-4">
                        <Calendar className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{stream.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{stream.artist}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{stream.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {stream.scheduledTime}
                      </div>
                    </div>
                    <Button className="w-full mt-3" variant="outline">
                      Set Reminder
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stream Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Stream Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Digital Art', 'Music Production', 'Street Art', 'Photography', 'Animation', 'Sculpture'].map((category) => (
                  <Button key={category} variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Play className="h-6 w-6" />
                    <span className="text-sm">{category}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LiveStreaming;
