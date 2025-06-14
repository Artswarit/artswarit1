
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
  // Determine if Request Project is applicable (for demo: only if artist.requestable is true)
  const canRequestProject = artist?.requestable !== false;

  return (
    <section className="relative w-full min-h-[330px] flex items-end md:items-center select-none">
      <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem] pointer-events-none">
        <img
          src={artist.cover}
          alt=""
          className="w-full h-full object-cover object-[center_30%] scale-[1.04] blur-sm opacity-[0.74] transition-all duration-300"
        />
        {/* Slightly darker soft glass */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-purple-900/10 to-blue-200/20" />
      </div>
      <div className="relative w-full flex flex-col md:flex-row items-end md:items-center justify-between z-10 gap-6 p-4 md:p-10 pb-4">
        {/* Avatar + Info */}
        <GlassCard className="flex items-end md:items-center gap-6 px-4 md:px-8 py-4 md:py-7 glass-effect bg-white/20 backdrop-blur-md border-white/20 shadow-xl md:shadow-2xl">
          <div className="flex flex-col md:flex-row gap-6 items-center w-full">
            {/* Avatar */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-tr from-slate-100/90 to-slate-200/80 overflow-hidden">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-full h-full object-cover rounded-full"
                  style={{
                    aspectRatio: "1/1",
                  }}
                />
              </div>
            </div>
            {/* Info and stats */}
            <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
              {/* Name & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-4xl font-bold font-heading drop-shadow-sm text-slate-900">
                  {artist.name}
                </h1>
                {artist.isVerified && (
                  <Badge className="glass-effect bg-blue-600/90 text-white flex items-center gap-1 px-3 py-1 text-[0.82rem] font-semibold shadow-inner animate-pulse border-2 border-white/60 drop-shadow">
                    <Verified size={15} /> Verified
                  </Badge>
                )}
                {artist.premium && (
                  <Badge className="glass-effect bg-gradient-to-r from-amber-400 to-yellow-300 text-yellow-900 flex items-center gap-1 px-3 py-1 text-[0.82rem] font-semibold shadow-inner shadow-amber-300 animate-pulse border-2 border-yellow-100/50 drop-shadow">
                    <Star size={15} /> Premium
                  </Badge>
                )}
              </div>
              {/* Tagline */}
              <div className="text-xs md:text-sm text-slate-700/80 max-w-2xl break-words leading-relaxed font-normal">
                {artist.tagline || artist.category}
              </div>
              {/* Tags */}
              {artist.tags && (
                <div className="flex flex-wrap gap-2 items-center my-1">
                  {artist.tags.map((t: string) => (
                    <span
                      key={t}
                      className="bg-purple-300/30 text-purple-900 px-3 py-0.5 rounded-full text-xs shadow-md hover:bg-purple-400/60 transition"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {/* Stats - add a soft glass card for separation */}
              <div className="w-full max-w-xs sm:max-w-sm mt-1">
                <div className="flex gap-4 justify-between bg-gradient-to-tr from-white/70 via-purple-100/60 to-blue-50/60 rounded-xl shadow-md px-3 py-2 backdrop-blur-sm border border-white/30">
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
          </div>
        </GlassCard>
        {/* Main Actions */}
        <div className="flex flex-col gap-2 items-stretch min-w-[210px] w-full md:w-auto max-w-md">
          <ArtistActionsBar
            isFollowing={isFollowing}
            onFollow={onFollow}
            onMessage={onMessage}
            onSave={onSave}
            onRequest={onRequest}
            canRequest={canRequestProject}
          />
          {/* Save & Request fallback for tiny screens */}
          <div className="flex gap-2 mt-2 flex-wrap md:hidden">
            <Button
              onClick={onSave}
              variant="outline"
              className="border-pink-400 text-pink-700 hover:bg-pink-200/50 hover:text-pink-900 shadow-md"
            >
              <Save size={17} className="mr-1" />
              Save Artist
            </Button>
            {canRequestProject && (
              <Button
                onClick={onRequest}
                variant="outline"
                className="border-yellow-400 text-amber-800 hover:bg-amber-100/70 hover:text-amber-900 shadow-md"
              >
                <FilePlus size={17} className="mr-1" />
                Request Project
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtistHeader;
