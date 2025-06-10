import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Heart, Eye, MapPin, Calendar, Award, Star, Play, Music, Video, Image as ImageIcon, MessageCircle, Briefcase } from "lucide-react";

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
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-md">
            <div className="relative">
              <img 
                src={item.thumbnail} 
                alt={item.title} 
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                {item.type === 'music' || item.type === 'video' ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/95 text-black hover:bg-white shadow-lg backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay();
                    }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                ) : (
                  <Button variant="secondary" size="lg" className="bg-white/95 text-black hover:bg-white shadow-lg backdrop-blur-sm">
                    <Eye className="w-5 h-5 mr-2" />
                    View Full Size
                  </Button>
                )}
              </div>
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="flex items-center gap-1 bg-black/70 text-white border-0">
                  {getTypeIcon()}
                  {item.type}
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="font-semibold text-xl mb-3 line-clamp-1">{item.title}</h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    {item.likes?.toLocaleString() || 0}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
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
          <DialogTitle className="text-2xl">{item.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {item.type === 'music' && item.audioUrl && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <audio controls className="w-full">
                <source src={item.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {item.type === 'video' && item.videoUrl && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <video controls className="w-full max-h-96 rounded-lg">
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
            <div className="flex items-center gap-6">
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-6 text-muted-foreground text-lg">Loading artist profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Artist Not Found</h1>
            <p className="text-muted-foreground mb-6 text-lg">The artist you're looking for doesn't exist.</p>
            <Button asChild size="lg">
              <Link to="/explore">Browse Artists</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        {/* Enhanced Cover Section */}
        <div className="relative h-80 md:h-96 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
          <img 
            src={artist.coverImage} 
            alt={`${artist.name} cover`} 
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          
          {/* Floating elements */}
          <div className="absolute top-6 right-6 flex gap-3">
            {artist.verified && (
              <Badge className="bg-blue-500/90 text-white border-0 backdrop-blur-sm">
                <Award className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {artist.premium && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black border-0 backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-24 relative z-10">
          {/* Enhanced Profile Section */}
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            {/* Profile Image */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative">
                <img 
                  src={artist.imageUrl} 
                  alt={artist.name} 
                  className="w-48 h-48 rounded-2xl border-4 border-white shadow-2xl object-cover" 
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-3 shadow-lg">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Enhanced Artist Info */}
            <div className="flex-1 text-center lg:text-left mt-8 lg:mt-16">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">{artist.name}</h1>
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                      <Badge variant="outline" className="text-base px-4 py-2">{artist.category}</Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {artist.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleFollow} 
                      size="lg"
                      className={`px-8 ${isFollowing ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600'}`}
                    >
                      <Users className="w-5 h-5 mr-2" />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="outline" size="lg" className="px-8">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>

                {/* Enhanced Stats */}
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{artist.followers.toLocaleString()}</div>
                    <div className="text-sm text-blue-600/70 font-medium">Followers</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                    <div className="text-3xl font-bold text-red-600 mb-1">{artist.likes.toLocaleString()}</div>
                    <div className="text-sm text-red-600/70 font-medium">Likes</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-3xl font-bold text-green-600 mb-1">{artist.views.toLocaleString()}</div>
                    <div className="text-sm text-green-600/70 font-medium">Views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enhanced Bio */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    About {artist.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">{artist.bio}</p>
                </CardContent>
              </Card>

              {/* Enhanced Portfolio */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    Portfolio
                  </CardTitle>
                  <CardDescription className="text-base">Explore {artist.name}'s creative works</CardDescription>
                </CardHeader>
                <CardContent>
                  {artist.portfolio && artist.portfolio.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {artist.portfolio.map(item => (
                        <PortfolioItem key={item.id} item={item} artistName={artist.id} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg">No portfolio items available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-8">
              {/* Enhanced Details */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-white" />
                    </div>
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3 text-base">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span>{artist.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>Joined {artist.joinDate}</span>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-4 text-lg">Specialties</h4>
                    <div className="flex flex-wrap gap-3">
                      {artist.specialties.map(specialty => (
                        <Badge key={specialty} variant="secondary" className="text-sm px-3 py-1">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Achievements */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-md flex items-center justify-center">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {artist.achievements.map(achievement => (
                      <div key={achievement} className="flex items-center gap-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Contact Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    Connect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Message Artist
                  </Button>
                  <Button className="w-full" variant="outline" size="lg">
                    <Briefcase className="w-5 h-5 mr-2" />
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
