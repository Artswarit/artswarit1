
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, Share2, Pin } from 'lucide-react';
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
}

const ArtworkCard = ({ artwork, onLike, onView }: ArtworkCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(artwork.id);
  };

  const handleShare = () => {
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
          onClick={() => onView?.(artwork.id)}
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
          <h3 className="font-semibold text-lg line-clamp-1">{artwork.title}</h3>
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
          <div className="flex items-center mb-3">
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
              <p className="text-sm font-medium">{artwork.profiles.full_name}</p>
              <Badge variant="outline" className="text-xs">
                {artwork.category}
              </Badge>
            </div>
          </div>
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
      </CardContent>
    </Card>
  );
};

export default ArtworkCard;
