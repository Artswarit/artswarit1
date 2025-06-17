
import React from "react";
import { MapPin, Calendar, Shield } from "lucide-react";
import StatCard from "./StatCard";
import ArtistActionsBar from "./ArtistActionsBar";

interface ArtistHeaderProps {
  artist: {
    id: string;
    name: string;
    category: string;
    avatar: string;
    bio?: string;
    tagline?: string;
    followers: number;
    likes: number;
    views: number;
    isVerified?: boolean;
    premium?: boolean;
    tags?: string[];
    location?: string;
    cover?: string;
  };
  isFollowing: boolean;
  onFollow: () => void;
  onMessage: () => void;
  isSaved: boolean;
  onSave: () => void;
  onRequest: () => void;
  loadingFollow: boolean;
  loadingSave: boolean;
}

const ArtistHeader: React.FC<ArtistHeaderProps> = ({
  artist,
  isFollowing,
  onFollow,
  onMessage,
  isSaved,
  onSave,
  onRequest,
  loadingFollow,
  loadingSave
}) => {
  return (
    <div className="relative w-full">
      {/* Cover Image */}
      <div className="relative h-64 lg:h-80 w-full overflow-hidden">
        <img 
          src={artist.cover || "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80"} 
          alt="Cover" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="relative -mt-20 lg:-mt-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6">
                {/* Avatar */}
                <div className="relative">
                  <img 
                    src={artist.avatar} 
                    alt={artist.name} 
                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-lg object-cover" 
                  />
                  {artist.premium && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 border-2 border-white">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Name and Basic Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center lg:items-center gap-3 mb-2">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                      {artist.name}
                    </h1>
                    {artist.isVerified && (
                      <div className="inline-flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <Shield className="h-3 w-3" />
                        Verified
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xl text-white/90 mb-2 font-medium">
                    {artist.category}
                  </p>
                  
                  {artist.location && (
                    <div className="flex items-center justify-center lg:justify-start gap-1 text-white/80 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{artist.location}</span>
                    </div>
                  )}

                  {/* Bio/Tagline */}
                  {artist.tagline && (
                    <p className="text-base max-w-2xl leading-relaxed text-white/90">
                      {artist.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Row - Mobile */}
              <div className="flex justify-center lg:hidden gap-8 mt-6">
                <StatCard type="followers" value={artist.followers} />
                <StatCard type="likes" value={artist.likes} />
                <StatCard type="views" value={artist.views} />
                <StatCard type="rating" value={4.8} />
              </div>
            </div>

            {/* Right Column - Actions and Stats */}
            <div className="flex flex-col items-center lg:items-end gap-6">
              {/* Action Buttons */}
              <div className="w-full max-w-xs">
                <ArtistActionsBar 
                  isFollowing={isFollowing} 
                  onFollow={onFollow} 
                  onMessage={onMessage} 
                  isSaved={isSaved} 
                  onSave={onSave} 
                  onRequest={onRequest} 
                  loadingSave={loadingSave} 
                />
              </div>

              {/* Stats Row - Desktop */}
              <div className="hidden lg:flex gap-6">
                <StatCard type="followers" value={artist.followers} />
                <StatCard type="likes" value={artist.likes} />
                <StatCard type="views" value={artist.views} />
                <StatCard type="rating" value={4.8} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;
