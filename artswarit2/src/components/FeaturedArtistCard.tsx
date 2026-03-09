
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface FeaturedArtistCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  verified?: boolean;
  premium?: boolean;
  followers?: number;
  bio?: string;
}

const FeaturedArtistCard = ({
  id,
  name,
  category,
  imageUrl,
  verified = false,
  premium = false,
  followers = 0,
  bio = "",
}: FeaturedArtistCardProps) => {
  return (
    <Link to={`/artist/${id}`}>
      <Card className="glass-card overflow-hidden hover-lift h-full">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2 flex-col sm:flex-row">
            {verified && (
              <span className="badge badge-verified text-xs flex items-center justify-center whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 mr-0.5 sm:w-3 sm:h-3 sm:mr-1">
                  <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Verified</span>
              </span>
            )}
            
            {premium && (
              <span className="badge badge-premium text-xs flex items-center justify-center whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 mr-0.5 sm:w-3 sm:h-3 sm:mr-1">
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Premium</span>
              </span>
            )}
          </div>
        </div>

        <CardContent className="p-2 sm:p-4">
          <h3 className="font-heading font-semibold text-sm sm:text-lg line-clamp-1">{name}</h3>
          <p className="text-muted-foreground text-xs sm:text-sm">{category}</p>
          
          {/* Bio preview if available */}
          {bio && (
            <p className="text-xs sm:text-sm mt-1 line-clamp-2 text-gray-600">{bio}</p>
          )}
          
          {/* Followers count */}
          <div className="flex items-center gap-1 mt-1 sm:gap-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            <Users size={12} className="sm:w-4 sm:h-4" />
            <span>{followers.toLocaleString()} followers</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default FeaturedArtistCard;
