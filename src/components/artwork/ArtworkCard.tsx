
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Eye, Play, Music, Video, Image as ImageIcon, User, ShoppingCart, Star } from "lucide-react";

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
        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer bg-white border-0 shadow-lg">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Enhanced overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              {(type === 'music' || type === 'video') && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white/95 text-black hover:bg-white shadow-2xl backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform"
                  onClick={handlePlay}
                >
                  <Play className="w-6 h-6 mr-2" />
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              )}
            </div>

            {/* Enhanced type badge */}
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="flex items-center gap-2 bg-black/70 text-white border-0 backdrop-blur-sm px-3 py-1">
                {getTypeIcon()}
                <span className="font-medium">{type}</span>
              </Badge>
            </div>

            {/* Enhanced like button */}
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/90 hover:bg-white text-black rounded-full p-3 shadow-lg backdrop-blur-sm"
                onClick={handleLike}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Enhanced price tag */}
            <div className="absolute bottom-4 right-4">
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 px-4 py-2 text-lg font-semibold shadow-lg">
                ${price}
              </Badge>
            </div>

            {/* Quality indicator */}
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-1 bg-black/70 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">HD</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xl line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {title}
                </h3>
                <p className="text-base text-muted-foreground font-medium">{category}</p>
              </div>

              <div className="flex items-center justify-between">
                <Link 
                  to={`/artist/${artistId}`}
                  className="flex items-center gap-3 text-base text-muted-foreground hover:text-purple-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="line-clamp-1 font-medium">{artist}</span>
                </Link>
              </div>

              <div className="flex items-center justify-between text-base">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2 text-red-500">
                    <Heart className="w-5 h-5" />
                    <span className="font-semibold">{likes.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-2 text-blue-500">
                    <Eye className="w-5 h-5" />
                    <span className="font-semibold">{views.toLocaleString()}</span>
                  </span>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-3xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          {/* Enhanced media content */}
          <div className="space-y-6">
            {type === 'music' && audioUrl && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            {type === 'video' && videoUrl && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
                <video controls className="w-full max-h-96 rounded-xl">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              </div>
            )}
            
            <div className="relative">
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full max-h-[500px] object-contain rounded-xl bg-gray-50 shadow-lg"
              />
            </div>
          </div>

          {/* Enhanced artwork info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Artwork Details</h3>
                <div className="space-y-3 text-base">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Category:</span>
                    <span className="font-semibold">{category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Type:</span>
                    <span className="capitalize font-semibold">{type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Price:</span>
                    <span className="font-bold text-green-600 text-lg">${price}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-red-500" />
                    <span className="font-bold text-lg">{likes.toLocaleString()} likes</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-blue-500" />
                    <span className="font-bold text-lg">{views.toLocaleString()} views</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Artist</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{artist}</p>
                    <p className="text-base text-muted-foreground">Professional Artist</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Link to={`/artist/${artistId}`}>
                  <Button className="w-full" variant="outline" size="lg">
                    <User className="w-5 h-5 mr-2" />
                    Visit Artist Profile
                  </Button>
                </Link>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" size="lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Purchase for ${price}
                </Button>
                <Button className="w-full" variant="secondary" size="lg">
                  <Heart className="w-5 h-5 mr-2" />
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
