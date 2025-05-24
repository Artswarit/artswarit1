
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Heart, Eye, MapPin, Calendar, Award, Star } from "lucide-react";

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
        type: "Audio",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 1250,
        plays: 8900
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
        type: "Book",
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
        type: "Audio",
        thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 890,
        plays: 12000
      }
    ]
  }
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-artswarit-purple mx-auto"></div>
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
        <div className="relative h-64 md:h-80 bg-gradient-to-r from-artswarit-purple to-blue-500">
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
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{artist.name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <Badge variant="secondary">{artist.category}</Badge>
                    {artist.verified && <Badge variant="default">Verified</Badge>}
                    {artist.premium && <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">Premium</Badge>}
                  </div>
                </div>
                <Button
                  onClick={handleFollow}
                  className={`ml-auto ${isFollowing ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gradient-to-r from-artswarit-purple to-blue-500'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 text-white/90 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{artist.followers.toLocaleString()} followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{artist.likes.toLocaleString()} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{artist.views.toLocaleString()} views</span>
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
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{artist.bio}</p>
                </CardContent>
              </Card>

              {/* Portfolio */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                  <CardDescription>Recent works and creations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {artist.portfolio.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{item.type}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {item.likes || item.reads || item.plays}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    <h4 className="font-medium mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {artist.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline">{specialty}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {artist.achievements.map((achievement) => (
                      <div key={achievement} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-gradient-to-r from-artswarit-purple to-blue-500 rounded-full"></div>
                        <span>{achievement}</span>
                      </div>
                    ))}
                  </div>
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
