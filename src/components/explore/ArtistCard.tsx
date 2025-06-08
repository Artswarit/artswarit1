
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Heart, Eye, MapPin, Star, Award, Crown, CheckCircle } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  tagline: string;
  category: string;
  imageUrl: string;
  verified: boolean;
  premium: boolean;
  featured: boolean;
  available: boolean;
  followers: number;
  artworkCount: number;
  rating: number;
  location: string;
  priceRange: string;
  viewsCount: number;
  likesCount: number;
  joinedDate: string;
  tags: string[];
}

interface ArtistCardProps {
  artist: Artist;
  viewMode: 'grid' | 'list';
  onFollow: (artistId: string) => void;
}

const ArtistCard = ({ artist, viewMode, onFollow }: ArtistCardProps) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    onFollow(artist.id);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (viewMode === 'list') {
    return (
      <Link to={`/artist/${artist.id}`}>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={artist.imageUrl} alt={artist.name} />
                  <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {artist.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{artist.name}</h3>
                      <div className="flex gap-1">
                        {artist.featured && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {artist.premium && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                            <Award className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{artist.category}</p>
                    <p className="text-sm text-gray-500 truncate mb-2">{artist.tagline}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{formatNumber(artist.followers)} followers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatNumber(artist.viewsCount)} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{artist.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{artist.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        artist.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {artist.available ? 'Available' : 'Busy'}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {artist.priceRange}
                      </span>
                    </div>
                    <Button
                      onClick={handleFollow}
                      size="sm"
                      variant={isFollowing ? 'secondary' : 'default'}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/artist/${artist.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full">
        <div className="relative aspect-square">
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {artist.featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                <Crown className="w-2 h-2 mr-1" />
                Featured
              </Badge>
            )}
            {artist.premium && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                <Award className="w-2 h-2 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          
          {artist.verified && (
            <div className="absolute bottom-2 left-2 bg-blue-500 text-white rounded-full p-1">
              <CheckCircle className="w-3 h-3" />
            </div>
          )}

          <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs ${
            artist.available 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {artist.available ? 'Available' : 'Busy'}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{artist.name}</h3>
              <p className="text-sm text-gray-600">{artist.category}</p>
            </div>
            <span className="text-sm font-medium text-gray-600 ml-2">
              {artist.priceRange}
            </span>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{artist.tagline}</p>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{formatNumber(artist.followers)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{formatNumber(artist.likesCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{artist.rating}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{artist.location}</span>
            </div>
            <Button
              onClick={handleFollow}
              size="sm"
              variant={isFollowing ? 'secondary' : 'default'}
              className="ml-2"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ArtistCard;
