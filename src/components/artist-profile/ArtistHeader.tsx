
import React from "react";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { Verified, Star, Users, Heart, Eye, Send, UserPlus, Lock } from "lucide-react";

type Props = {
  artist: any; // Use proper type if you have
  onFollow: () => void;
  isFollowing: boolean;
  onMessage?: () => void;
};

const ArtistHeader: React.FC<Props> = ({
  artist,
  onFollow,
  isFollowing,
  onMessage,
}) => {
  return (
    <div className="relative w-full min-h-[300px] flex items-end md:items-center">
      {/* Blurred Artwork or Gradient */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem]">
        <img
          src={artist.cover}
          alt=""
          className="w-full h-full object-cover object-[center_30%] scale-110 blur-md opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-purple-900/20 to-blue-500/10" />
      </div>
      <div className="relative w-full flex flex-col md:flex-row items-end md:items-center justify-between z-10 gap-6 p-4 md:p-10 pb-4">
        {/* Avatar + Info */}
        <div className="flex items-end md:items-center gap-6">
          <GlassCard className="p-2 md:p-3 flex flex-col items-center justify-center shadow-xl border-white/30">
            <img
              src={artist.avatar}
              alt={artist.name}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white object-cover shadow-md"
              style={{ background: "white" }}
            />
          </GlassCard>
          <div className="flex flex-col gap-2 text-white md:text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-4xl font-bold font-heading">{artist.name}</h1>
              {artist.isVerified && (
                <Badge className="glass-effect bg-blue-500/70 text-white flex items-center gap-1">
                  <Verified size={15} /> Verified
                </Badge>
              )}
              {artist.premium && (
                <Badge className="glass-effect bg-yellow-400/80 text-black flex items-center gap-1">
                  <Star size={15} /> Premium
                </Badge>
              )}
            </div>
            <div className="text-base md:text-lg font-medium text-slate-200">
              {artist.tagline || artist.category}
            </div>
            <div className="flex flex-wrap gap-2 items-center my-2">
              {artist.tags && artist.tags.map((t: string) => (
                <span key={t} className="bg-purple-300/20 text-purple-100 px-3 py-0.5 rounded-full text-xs">{t}</span>
              ))}
            </div>
            <div className="flex gap-6 mt-1">
              <div className="flex flex-col items-center gap-0">
                <Users size={16} className="opacity-90" />
                <span className="font-bold text-lg">{artist.followers}</span>
                <span className="text-xs -mt-1 text-slate-300">Followers</span>
              </div>
              <div className="flex flex-col items-center gap-0">
                <Heart size={16} className="opacity-90" />
                <span className="font-bold text-lg">{artist.likes}</span>
                <span className="text-xs -mt-1 text-slate-300">Likes</span>
              </div>
              <div className="flex flex-col items-center gap-0">
                <Eye size={16} className="opacity-90" />
                <span className="font-bold text-lg">{artist.views || 0}</span>
                <span className="text-xs -mt-1 text-slate-300">Views</span>
              </div>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="flex flex-col gap-2 items-stretch">
          <GlassButton
            variant={isFollowing ? "secondary" : "primary"}
            className="w-36 shadow-lg font-semibold"
            onClick={onFollow}
          >
            <UserPlus className="mr-2" size={18} />
            {isFollowing ? "Unfollow" : "Follow"}
          </GlassButton>
          {onMessage && (
            <GlassButton variant="ghost" className="w-36 mt-1" onClick={onMessage}>
              <Send className="mr-2" size={18} /> Message
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;
