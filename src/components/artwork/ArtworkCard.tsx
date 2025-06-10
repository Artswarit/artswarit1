
import { useState } from 'react';
import { Heart, Eye, Play, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

interface ArtworkCardProps {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  type: string;
  imageUrl: string;
  likes: number;
  views: number;
  price?: number;
  category?: string;
  audioUrl?: string;
  videoUrl?: string;
}

const ArtworkCard = ({
  id,
  title,
  artist,
  artistId,
  type,
  imageUrl,
  likes,
  views,
  price,
  category,
  audioUrl,
  videoUrl
}: ArtworkCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setCurrentLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handlePlay = () => {
    // Handle play functionality
    console.log('Playing artwork:', id);
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'music':
      case 'audio':
        return <Play className="w-4 h-4" />;
      case 'video':
        return <Play className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <GlassCard 
      className="group overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={handlePlay}
              className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 rounded-full p-4"
            >
              {getTypeIcon()}
            </Button>
          </div>
          
          {/* Top Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={handleLike}
              variant="ghost"
              size="sm"
              className={`bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 ${
                isLiked ? 'text-red-500' : 'text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          {/* Bottom Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {currentLikes}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {views}
                </span>
              </div>
              {price !== undefined && (
                <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-xs font-medium">
                  {price === 0 ? 'Free' : `$${price}`}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/20 backdrop-blur-md border border-white/30 px-2 py-1 rounded-full text-xs font-medium text-white capitalize">
            {type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {title}
          </h3>
          <Link 
            to={`/artist/${artistId}`}
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300"
          >
            by {artist}
          </Link>
        </div>
        
        {category && (
          <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            {category}
          </span>
        )}
        
        {/* Stats Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {currentLikes}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {views}
            </span>
          </div>
          
          <Link
            to={`/artwork/${id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-300"
          >
            View Details
          </Link>
        </div>
      </div>
    </GlassCard>
  );
};

export default ArtworkCard;
