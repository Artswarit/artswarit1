import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { Users, Heart, Eye, MapPin, Calendar, Award, Star, Play, Music, Video, Image as ImageIcon, Check, Plus } from "lucide-react";

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
    <div className="group cursor-pointer">
      <GlassCard className="overflow-hidden hover:scale-105 transition-all duration-500">
        <div className="relative">
          <img 
            src={item.thumbnail} 
            alt={item.title} 
            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {item.likes?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {(item.views || item.plays || item.reads || 0).toLocaleString()}
                  </span>
                </div>
                {(item.type === 'music' || item.type === 'video') && (
                  <GlassButton
                    size="sm"
                    variant="secondary"
                    onClick={handlePlay}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {isPlaying ? 'Pause' : 'Play'}
                  </GlassButton>
                )}
              </div>
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="flex items-center gap-1 bg-black/30 text-white border-white/20">
              {getTypeIcon()}
              {item.type}
            </Badge>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

const ArtistProfile = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <GlassCard className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground text-center">Loading artist profile...</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <GlassCard className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Artist Not Found</h1>
            <p className="text-muted-foreground mb-4">The artist you're looking for doesn't exist.</p>
            <GlassButton>
              <Link to="/explore">Browse Artists</Link>
            </GlassButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Banner */}
        <div className="relative h-[60vh] overflow-hidden">
          <img 
            src={artist.coverImage} 
            alt={`${artist.name} cover`} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Profile Section */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="relative">
                  <img 
                    src={artist.imageUrl} 
                    alt={artist.name} 
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 shadow-2xl object-cover backdrop-blur-sm" 
                  />
                  {artist.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-lg">
                      <Award className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left text-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold mb-2">{artist.name}</h1>
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {artist.category}
                        </Badge>
                        {artist.verified && (
                          <Badge className="bg-blue-500/80 text-white border-blue-400/50">
                            <Award className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {artist.premium && (
                          <Badge className="bg-gradient-to-r from-yellow-400/80 to-orange-500/80 text-black border-yellow-300/50">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {artist.specialties.map(specialty => (
                          <span key={specialty} className="px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/20">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <GlassButton 
                      onClick={handleFollow}
                      size="lg"
                      variant={isFollowing ? 'secondary' : 'primary'}
                      className="shrink-0"
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2" />
                          Follow
                        </>
                      )}
                    </GlassButton>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 max-w-md mx-auto md:mx-0">
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
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold mb-4">About {artist.name}</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{artist.bio}</p>
              </GlassCard>

              {/* Portfolio */}
              <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Portfolio</h2>
                  <div className="flex gap-2">
                    {['all', 'premium', 'exclusive'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === tab 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {artist.portfolio && artist.portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {artist.portfolio.map(item => (
                      <PortfolioItem key={item.id} item={item} artistName={artist.id} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">No portfolio items available yet.</p>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Details */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold mb-4">Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span>{artist.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>Joined {artist.joinDate}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Achievements */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Achievements
                </h3>
                <div className="space-y-3">
                  {artist.achievements.map(achievement => (
                    <div key={achievement} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Actions */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold mb-4">Connect</h3>
                <div className="space-y-3">
                  <GlassButton className="w-full" variant="primary">
                    Message Artist
                  </GlassButton>
                  <GlassButton className="w-full" variant="secondary">
                    Hire for Project
                  </GlassButton>
                  <GlassButton className="w-full" variant="ghost">
                    Share Profile
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtistProfile;
