
import React from "react";
import GlassCard from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import StatCard from "./StatCard";
import ArtistActionsBar from "./ArtistActionsBar";
import { Verified, Star } from "lucide-react";

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
          className="w-full h-full object-cover object-[center_30%] scale-110 blur-md opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-purple-900/30 to-blue-500/20" />
      </div>
      <div className="relative w-full flex flex-col md:flex-row items-end md:items-center justify-between z-10 gap-6 p-4 md:p-10 pb-4">
        {/* Avatar + Info */}
        <div className="flex items-end md:items-center gap-7">
          <GlassCard className="p-3 flex flex-col items-center justify-center shadow-xl border-white/30">
            <img
              src={artist.avatar}
              alt={artist.name}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white object-cover shadow-md"
              style={{ background: "white" }}
            />
          </GlassCard>
          <div className="flex flex-col gap-2 text-white md:text-left min-w-[220px]">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-5xl font-bold font-heading drop-shadow">
                {artist.name}
              </h1>
              {artist.isVerified && (
                <Badge className="glass-effect bg-blue-600/80 text-white flex items-center gap-1 px-3 py-1 text-[0.82rem] font-semibold shadow-inner shadow-blue-300 animate-pulse">
                  <Verified size={16} /> Verified
                </Badge>
              )}
              {artist.premium && (
                <Badge className="glass-effect bg-gradient-to-r from-amber-400 to-yellow-300 text-yellow-900 flex items-center gap-1 px-3 py-1 text-[0.82rem] font-semibold shadow-inner shadow-amber-200 animate-pulse">
                  <Star size={16} /> Premium
                </Badge>
              )}
            </div>
            <div className="text-lg md:text-2xl font-medium text-slate-200 drop-shadow">
              {artist.tagline || artist.category}
            </div>
            <div className="flex flex-wrap gap-2 items-center my-2">
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
            <div className="flex gap-4 mt-3">
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
        {/* Modern Actions */}
        <div className="flex flex-col gap-3 items-stretch min-w-[230px]">
          <ArtistActionsBar
            isFollowing={isFollowing}
            onFollow={onFollow}
            onMessage={onMessage}
            onSave={onSave}
            onRequest={onRequest}
          />
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;
