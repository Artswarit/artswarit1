
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, Share2, Pin, User, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Artwork {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  tags: string[];
  price?: number;
  is_for_sale: boolean;
  is_pinned: boolean;
  views_count: number;
  likes_count: number;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
}

interface ArtworkCardProps {
  artwork: Artwork;
  onLike?: (artworkId: string) => void;
  onView?: (artworkId: string) => void;
  viewMode?: 'grid' | 'list';
}

const ArtworkCard = ({ artwork, onLike, onView, viewMode = 'grid' }: ArtworkCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(artwork.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: artwork.title,
        text: artwork.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleView = () => {
    onView?.(artwork.id);
  };

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Artwork Image */}
            <div className="relative flex-shrink-0">
              {artwork.is_pinned && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                </div>
              )}
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-32 h-32 object-cover rounded-lg cursor-pointer group-hover:scale-105 transition-transform duration-300"
                onClick={handleView}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1 cursor-pointer hover:text-purple-600" onClick={handleView}>
                    {artwork.title}
                  </h3>
                  {artwork.profiles && (
                    <Link 
                      to={`/artist/${artwork.profiles.full_name}`}
                      className="flex items-center mt-1 hover:text-purple-600 transition-colors"
                    >
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{artwork.profiles.full_name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {artwork.category}
                      </Badge>
                    </Link>
                  )}
                </div>
                {artwork.is_for_sale && artwork.price && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ${artwork.price}
                  </Badge>
                )}
              </div>

              {artwork.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{artwork.description}</p>
              )}

              {/* Tags */}
              {artwork.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {artwork.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {artwork.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{artwork.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Stats and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {artwork.views_count}
                  </div>
                  <div className="flex items-center">
                    <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {artwork.likes_count}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  {user && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleLike}
                      className={`hover:bg-red-50 ${isLiked ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                  )}
                  <Link to={`/artist/${artwork.profiles?.full_name}`}>
                    <Button size="sm" variant="default">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Artist
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative">
        {artwork.is_pinned && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Pin className="h-3 w-3 mr-1" />
              Pinned
            </Badge>
          </div>
        )}
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleView}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        
        {/* Action buttons overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1 cursor-pointer hover:text-purple-600" onClick={handleView}>
            {artwork.title}
          </h3>
          {artwork.is_for_sale && artwork.price && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              ${artwork.price}
            </Badge>
          )}
        </div>

        {artwork.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{artwork.description}</p>
        )}

        {/* Artist info */}
        {artwork.profiles && (
          <Link 
            to={`/artist/${artwork.profiles.full_name}`}
            className="flex items-center mb-3 hover:text-purple-600 transition-colors group/artist"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
              {artwork.profiles.avatar_url ? (
                <img
                  src={artwork.profiles.avatar_url}
                  alt={artwork.profiles.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold">
                  {artwork.profiles.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium group-hover/artist:text-purple-600 transition-colors">
                {artwork.profiles.full_name}
              </p>
              <Badge variant="outline" className="text-xs">
                {artwork.category}
              </Badge>
            </div>
          </Link>
        )}

        {/* Tags */}
        {artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {artwork.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {artwork.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{artwork.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {artwork.views_count}
            </div>
            <div className="flex items-center">
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {artwork.likes_count}
            </div>
          </div>
          
          {user && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLike}
              className={`hover:bg-red-50 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>

        {/* View Artist Button */}
        <Link to={`/artist/${artwork.profiles?.full_name}`} className="block mt-3">
          <Button variant="outline" className="w-full">
            <User className="h-4 w-4 mr-1" />
            View Artist Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ArtworkCard;
