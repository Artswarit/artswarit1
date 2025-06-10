
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Heart, Eye, MapPin, Calendar, Award, Star, Play, Music, Video, Image as ImageIcon } from "lucide-react";

// Mock artist data - In a real app, this would come from an API
const artistsData = {
  "1": {
    id: "1",
    name: "Alex Rivera",
    category: "Musician",
    imageUrl: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    verified: true,
    premium: true,
    followers: 12543,
    following: 456,
    likes: 4580,
    views: 28750,
    bio: "Multi-platinum musician with over 10 years of experience in the industry. Passionate about creating music that moves people and tells stories.",
    location: "Los Angeles, CA",
    joinDate: "January 2020",
    specialties: ["Pop", "Rock", "Electronic", "Acoustic"],
    achievements: ["Grammy Nominee", "Platinum Album", "10M+ Streams"],
    portfolio: [
      {
        id: "1",
        title: "Midnight Symphony",
        type: "music",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 1250,
        plays: 8900,
        audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav"
      },
      {
        id: "2",
        title: "Live Concert 2024",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 2100,
        views: 45000,
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
      },
      {
        id: "3",
        title: "Album Cover Art",
        type: "image",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 890,
        views: 12000
      }
    ]
  },
  "2": {
    id: "2",
    name: "Maya Johnson",
    category: "Writer",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    verified: true,
    premium: false,
    followers: 8765,
    following: 234,
    likes: 3240,
    views: 19500,
    bio: "Award-winning author specializing in fantasy and science fiction novels. Creating worlds that inspire imagination and wonder.",
    location: "New York, NY",
    joinDate: "March 2019",
    specialties: ["Fantasy", "Sci-Fi", "Young Adult", "Short Stories"],
    achievements: ["Hugo Award Winner", "Bestselling Author", "5+ Published Novels"],
    portfolio: [
      {
        id: "2",
        title: "The Crystal Realm",
        type: "image",
        thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 2100,
        reads: 45000
      }
    ]
  },
  "3": {
    id: "3",
    name: "Jordan Smith",
    category: "Rapper",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    verified: false,
    premium: true,
    followers: 6421,
    following: 189,
    likes: 2870,
    views: 16200,
    bio: "Underground hip-hop artist known for thought-provoking lyrics and innovative beats. Bringing conscious rap to the mainstream.",
    location: "Atlanta, GA",
    joinDate: "June 2021",
    specialties: ["Hip-Hop", "Conscious Rap", "Freestyle", "Beatmaking"],
    achievements: ["Viral Hit", "Independent Artist", "1M+ Views"],
    portfolio: [
      {
        id: "3",
        title: "Street Philosophy",
        type: "music",
        thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 890,
        plays: 12000,
        audioUrl: "https://www.soundjay.com/misc/sounds/magic-chime-02.wav"
      }
    ]
  }
};

const PortfolioItem = ({ item, artistName }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control actual audio/video playback
    console.log(`${isPlaying ? 'Pausing' : 'Playing'} ${item.title}`);
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'music':
        return <Music className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group cursor-pointer">
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="relative">
              <img 
                src={item.thumbnail} 
                alt={item.title} 
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                {item.type === 'music' || item.type === 'video' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 text-black hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay();
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="bg-white/90 text-black hover:bg-white">
                    View Full Size
                  </Button>
                )}
              </div>
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getTypeIcon()}
                  {item.type}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.title}</h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {item.likes?.toLocaleString() || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {(item.views || item.plays || item.reads || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {item.type === 'music' && item.audioUrl && (
            <div>
              <audio controls className="w-full">
                <source src={item.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {item.type === 'video' && item.videoUrl && (
            <div>
              <video controls className="w-full max-h-96">
                <source src={item.videoUrl} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            </div>
          )}
          <img 
            src={item.thumbnail} 
            alt={item.title} 
            className="w-full max-h-96 object-contain rounded-lg"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                {item.likes?.toLocaleString() || 0} likes
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                {(item.views || item.plays || item.reads || 0).toLocaleString()} {item.type === 'music' ? 'plays' : 'views'}
              </span>
            </div>
            <Link to={`/artist/${artistName}`}>
              <Button variant="outline">Visit Artist Profile</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ArtistProfile = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchArtist = () => {
      setIsLoading(true);
      setTimeout(() => {
        const artistData = artistsData[id];
        if (artistData) {
          setArtist(artistData);
        }
        setIsLoading(false);
      }, 500);
    };

    fetchArtist();
  }, [id]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading artist profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Artist Not Found</h1>
            <p className="text-muted-foreground mb-4">The artist you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/explore">Browse Artists</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Cover Image */}
        <div className="relative h-64 md:h-80 bg-gradient-to-r from-purple-600 to-blue-500">
          <img 
            src={artist.coverImage} 
            alt={`${artist.name} cover`} 
            className="w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Profile Image and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <img 
                  src={artist.imageUrl} 
                  alt={artist.name} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover" 
                />
                {artist.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2">
                    <Award className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Artist Details */}
            <div className="flex-1 text-center md:text-left mt-4 md:mt-12">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{artist.name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <Badge variant="secondary" className="text-sm">{artist.category}</Badge>
                    {artist.verified && (
                      <Badge variant="default" className="bg-blue-500 text-white">
                        <Award className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {artist.premium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                        <Star className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={handleFollow} 
                  size="lg"
                  className={`ml-auto ${isFollowing ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-6 text-white/90">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold">{artist.followers.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Followers</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Heart className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold">{artist.likes.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Likes</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Eye className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold">{artist.views.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Views</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">About {artist.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-base">{artist.bio}</p>
                </CardContent>
              </Card>

              {/* Enhanced Portfolio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Portfolio</CardTitle>
                  <CardDescription>Explore {artist.name}'s creative works</CardDescription>
                </CardHeader>
                <CardContent>
                  {artist.portfolio && artist.portfolio.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {artist.portfolio.map(item => (
                        <PortfolioItem key={item.id} item={item} artistName={artist.id} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No portfolio items available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{artist.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined {artist.joinDate}</span>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {artist.specialties.map(specialty => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {artist.achievements.map(achievement => (
                      <div key={achievement} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"></div>
                        <span className="text-sm">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact/Action Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Connect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="default">
                    Message Artist
                  </Button>
                  <Button className="w-full" variant="outline">
                    Hire for Project
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtistProfile;
