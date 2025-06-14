
import React from "react";
import GlassCard from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import StatCard from "./StatCard";
import ArtistActionsBar from "./ArtistActionsBar";
import { Verified, Star, Save, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  artist: any;
  onFollow: () => void;
  isFollowing: boolean;
  onMessage: () => void;
  onSave: () => void;
  onRequest: () => void;
};

const ArtistHeader: React.FC<Props> = ({
  artist,
  onFollow,
  isFollowing,
  onMessage,
  onSave,
  onRequest,
}) => {
  // Stats for dopamine effect
  const stats = [
    {
      type: "followers",
      value: artist.followers,
      label: "Followers",
    },
    {
      type: "likes",
      value: artist.likes,
      label: "Likes",
    },
    {
      type: "views",
      value: artist.views,
      label: "Views",
    },
  ];
  return (
    <div className="relative w-full min-h-[330px] flex items-end md:items-center">
      <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem]">
        <img
          src={artist.cover}
          alt=""
          className="w-full h-full object-cover object-[center_30%] scale-105 blur-sm opacity-85 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-purple-900/10 to-blue-500/10" />
      </div>
      <div className="relative w-full flex flex-col md:flex-row items-end md:items-center justify-between z-10 gap-6 p-4 md:p-10 pb-4">
        {/* Avatar + Info */}
        {/* NEW: Add a glass-card background behind avatar and main info */}
        <GlassCard className="flex items-end md:items-center gap-7 px-6 py-5 md:py-7 glass-effect bg-black/50 backdrop-blur-md border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-7 items-center">
            {/* Avatar */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white object-cover shadow-md"
                style={{
                  aspectRatio: "1/1",
                  background: "white",
                }}
              />
            </div>
            {/* Info and stats */}
            <div className="flex flex-col gap-2 text-white md:text-left min-w-[220px]">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-5xl font-bold font-heading drop-shadow">
                  {artist.name}
                </h1>
                {artist.isVerified && (
                  <Badge className="glass-effect bg-blue-600/90 text-white flex items-center gap-1 px-3 py-1 text-[0.82rem] font-semibold shadow-inner shadow-blue-400 animate-pulse border-2 border-white/70 drop-shadow-md">
                    <Verified size={16} /> Verified
                  </Badge>
                )}
                {artist.premium && (
                  <Badge className="glass-effect bg-gradient-to-r from-amber-400 to-yellow-300 text-yellow-900 flex items-center gap-1 px-3 py-1 text-[0.82rem] font-semibold shadow-inner shadow-amber-300 animate-pulse border-2 border-yellow-100/60 drop-shadow-md">
                    <Star size={16} /> Premium
                  </Badge>
                )}
              </div>
              <div className="text-[0.82rem] md:text-sm text-slate-200/90 drop-shadow font-normal leading-relaxed">
                {/* Small bio */}
                {artist.tagline || artist.category}
              </div>
              <div className="flex flex-wrap gap-2 items-center my-1">
                {artist.tags &&
                  artist.tags.map((t: string) => (
                    <span
                      key={t}
                      className="bg-purple-300/30 text-purple-100 px-3 py-0.5 rounded-full text-xs shadow-lg cursor-pointer hover:bg-purple-400/60"
                    >
                      {t}
                    </span>
                  ))}
              </div>
              {/* Dopamine trigger stats */}
              <div className="flex gap-6 mt-2">
                {stats.map((stat) => (
                  <StatCard
                    key={stat.type}
                    type={stat.type as any}
                    value={stat.value}
                    label={stat.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
        {/* Main Actions */}
        <div className="flex flex-col gap-2 items-stretch min-w-[230px]">
          <ArtistActionsBar
            isFollowing={isFollowing}
            onFollow={onFollow}
            onMessage={onMessage}
            onSave={onSave}
            onRequest={onRequest}
          />
          {/* Save & Request relocated, only as fallback for tiny screens */}
          <div className="flex gap-2 mt-2 flex-wrap md:hidden">
            <Button
              onClick={onSave}
              variant="outline"
              className="border-pink-400 text-pink-700 hover:bg-pink-200/50 hover:text-pink-900"
            >
              <Save size={17} className="mr-1" />
              Save Artist
            </Button>
            <Button
              onClick={onRequest}
              variant="outline"
              className="border-yellow-400 text-amber-800 hover:bg-amber-100/70 hover:text-amber-900"
            >
              <FilePlus size={17} className="mr-1" />
              Request Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;

