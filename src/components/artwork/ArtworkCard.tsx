
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Eye, Play, Music, Video, Image as ImageIcon, User } from "lucide-react";

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
  videoUrl,
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
        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Overlay with play button for media */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              {(type === 'music' || type === 'video') && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white/90 text-black hover:bg-white shadow-lg"
                  onClick={handlePlay}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              )}
            </div>

            {/* Type badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="flex items-center gap-1 bg-white/90 text-black">
                {getTypeIcon()}
                {type}
              </Badge>
            </div>

            {/* Like button */}
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/90 hover:bg-white text-black rounded-full p-2"
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Price tag */}
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-green-600 text-white">
                ${price}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{category}</p>
              </div>

              <div className="flex items-center justify-between">
                <Link 
                  to={`/artist/${artistId}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-purple-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <User className="w-4 h-4" />
                  <span className="line-clamp-1">{artist}</span>
                </Link>
              </div>

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
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Media content */}
          <div className="space-y-4">
            {type === 'music' && audioUrl && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            {type === 'video' && videoUrl && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <video controls className="w-full max-h-96 rounded-lg">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              </div>
            )}
            
            <div className="relative">
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full max-h-96 object-contain rounded-lg bg-gray-50"
              />
            </div>
          </div>

          {/* Artwork info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Artwork Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold text-green-600">${price}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    {likes.toLocaleString()} likes
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    {views.toLocaleString()} views
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Artist</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{artist}</p>
                    <p className="text-sm text-muted-foreground">Professional Artist</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link to={`/artist/${artistId}`}>
                  <Button className="w-full" variant="outline">
                    Visit Artist Profile
                  </Button>
                </Link>
                <Button className="w-full">
                  Purchase for ${price}
                </Button>
                <Button className="w-full" variant="secondary">
                  Message Artist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkCard;
