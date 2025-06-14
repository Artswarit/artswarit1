
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
          className="w-full h-full object-cover object-[center_30%] scale-105 blur-sm opacity-80 transition-all duration-300"
        />
        {/* Strengthen overlay for clarity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>
      <div className="relative w-full flex flex-col md:flex-row items-end md:items-center justify-between z-10 gap-6 p-4 md:p-10 pb-4">
        {/* Avatar + Info glass box */}
        <div className="flex items-end md:items-center gap-7">
          <GlassCard className="p-2 flex flex-col items-center justify-center shadow-xl border-white/30 bg-white/40 backdrop-blur-md">
            <img
              src={artist.avatar}
              alt={artist.name}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white object-cover shadow-md"
              style={{
                aspectRatio: "1/1",
                background: "white",
              }}
            />
          </GlassCard>
          {/* Info block with better visibility */}
          <div className="flex flex-col gap-3 text-white md:text-left min-w-[220px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl md:text-5xl font-bold font-heading drop-shadow-lg">
                {artist.name}
              </h1>
              {artist.isVerified && (
                <Badge className="glass-effect bg-blue-600/90 text-white flex items-center gap-1 px-3 py-1 text-[0.82rem] font-semibold shadow-inner shadow-blue-400 border-2 border-white/70 drop-shadow-md">
                  <Verified size={16} /> Verified
                </Badge>
              )}
              {artist.premium && (
                <Badge className="glass-effect bg-gradient-to-r from-amber-400 to-yellow-300 text-yellow-900 flex items-center gap-1 px-3 py-1 text-[0.82rem] font-semibold shadow-inner shadow-amber-300 border-2 border-yellow-100/60 drop-shadow-md">
                  <Star size={16} /> Premium
                </Badge>
              )}
            </div>
            {/* Bio in more visible card */}
            <div className="text-[0.95rem] md:text-base text-slate-100 font-normal leading-relaxed max-w-md">
              <GlassCard className="bg-black/40 text-white px-4 py-2 shadow-md border-transparent">
                <span className="">{artist.tagline || artist.category}</span>
              </GlassCard>
            </div>
            {/* Tags with card style and better spacing */}
            <div className="flex flex-wrap gap-2 items-center mt-1">
              {artist.tags &&
                artist.tags.map((t: string) => (
                  <span
                    key={t}
                    className="bg-gradient-to-r from-purple-700/50 to-blue-700/40 text-[#e1dfff] px-3 py-1 rounded-full text-xs shadow hover:bg-purple-400/60 border border-white/10 backdrop-blur-lg"
                  >
                    {t}
                  </span>
                ))}
            </div>
            {/* Dopamine trigger stats, now in glass card for visibility */}
            <GlassCard className="flex gap-4 mt-3 px-2 py-2 bg-white/20 backdrop-blur-md max-w-md border-white/20 shadow-lg">
              {stats.map((stat) => (
                <StatCard
                  key={stat.type}
                  type={stat.type as any}
                  value={stat.value}
                  label={stat.label}
                />
              ))}
            </GlassCard>
          </div>
        </div>
        {/* Main Actions */}
        <div className="flex flex-col gap-2 items-stretch min-w-[230px]">
          <ArtistActionsBar
            isFollowing={isFollowing}
            onFollow={onFollow}
            onMessage={onMessage}
            onSave={onSave}
            onRequest={onRequest}
          />
          {/* Save & Request for tiny screens */}
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
