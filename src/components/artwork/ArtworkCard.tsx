
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Eye, Play, Music, Video, Image as ImageIcon, User, ShoppingCart } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";

interface ArtworkCardProps {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  type: string;
  imageUrl: string;
  likes: number;
  views: number;
  price: number;
  category: string;
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
  const [isPlaying, setIsPlaying] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    console.log(`${isPlaying ? 'Pausing' : 'Playing'} ${title}`);
  };

  const getTypeIcon = () => {
    switch (type) {
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
          <GlassCard className="overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-2xl">
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={imageUrl} 
                alt={title} 
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                loading="lazy" 
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4">
                {/* Top Row - Type and Like */}
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="flex items-center gap-1 bg-black/30 text-white border-white/20 backdrop-blur-sm">
                    {getTypeIcon()}
                    {type}
                  </Badge>
                  
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className="rounded-full p-2 bg-black/20"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </GlassButton>
                </div>

                {/* Center - Play Button */}
                {(type === 'music' || type === 'video') && (
                  <div className="flex items-center justify-center">
                    <GlassButton
                      variant="primary"
                      size="lg"
                      onClick={handlePlay}
                      className="rounded-full bg-white/20 border-white/30"
                    >
                      <Play className="w-6 h-6 mr-2" />
                      {isPlaying ? 'Pause' : 'Play'}
                    </GlassButton>
                  </div>
                )}

                {/* Bottom Row - Title and Stats */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-white line-clamp-1">
                    {title}
                  </h3>
                  <div className="flex items-center justify-between text-white/90 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {likes.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {views.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-green-400 font-semibold">
                      {price === 0 ? 'Free' : `$${price}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Badge - Always Visible */}
              <div className="absolute top-4 right-4 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                <Badge className={`${price === 0 ? 'bg-green-500' : 'bg-blue-500'} text-white shadow-lg`}>
                  {price === 0 ? 'Free' : `$${price}`}
                </Badge>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category}</p>
                </div>

                <Link 
                  to={`/artist/${artistId}`} 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-purple-600 transition-colors" 
                  onClick={e => e.stopPropagation()}
                >
                  <User className="w-4 h-4" />
                  <span className="line-clamp-1">{artist}</span>
                </Link>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {views.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-md border-white/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Media content */}
          <div className="space-y-4">
            {type === 'music' && audioUrl && (
              <GlassCard className="p-6">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </GlassCard>
            )}
            
            {type === 'video' && videoUrl && (
              <GlassCard className="p-6">
                <video controls className="w-full max-h-96 rounded-lg">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              </GlassCard>
            )}
            
            <GlassCard className="overflow-hidden">
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full max-h-96 object-contain"
              />
            </GlassCard>
          </div>

          {/* Artwork info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Artwork Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize font-medium">{type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold text-green-600">
                    {price === 0 ? 'Free' : `$${price}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-red-500" />
                    {likes.toLocaleString()} likes
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-blue-500" />
                    {views.toLocaleString()} views
                  </span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Artist</h3>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">{artist}</p>
                  <p className="text-sm text-muted-foreground">Professional Artist</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link to={`/artist/${artistId}`}>
                  <GlassButton variant="secondary" className="w-full">
                    Visit Artist Profile
                  </GlassButton>
                </Link>
                <GlassButton variant="primary" className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Purchase for {price === 0 ? 'Free' : `$${price}`}
                </GlassButton>
                <GlassButton variant="ghost" className="w-full">
                  Message Artist
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkCard;
