import React from "react";
import GlassCard from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import StatCard from "./StatCard";
import ArtistActionsBar from "./ArtistActionsBar";
import { Verified, Star, Save, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import RequestProjectModal from "./RequestProjectModal";
import { useState } from "react";

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

  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <section className="relative w-full min-h-[340px] flex items-end md:items-center select-none">
      {/* Background cover image */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem] pointer-events-none">
        <img
          src={artist.cover}
          alt=""
          className="w-full h-full object-cover object-[center_30%] scale-[1.01] blur-sm md:blur-[2px] opacity-[.85] transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/45 via-purple-900/10 to-blue-100/20" />
      </div>
      <div className="relative w-full flex flex-col md:flex-row items-end md:items-center justify-between z-10 gap-6 p-4 md:p-10 pb-4">
        {/* Avatar + Info */}
        <GlassCard className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-8 px-4 md:px-9 py-4 md:py-8 glass-effect bg-white/35 backdrop-blur-md border-white/20 shadow-xl max-w-3xl w-full">
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-tr from-slate-100/90 to-slate-200/80 overflow-hidden">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-full h-full object-cover rounded-full"
                style={{ aspectRatio: "1/1" }}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 sm:gap-2 min-w-[160px] w-full">
            {/* Name + Badges as one line, icons, consistent height/padding */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-4xl font-bold font-heading drop-shadow-sm text-slate-900">
                {artist.name}
              </h1>
              {artist.isVerified && (
                <Badge className="flex items-center gap-1 px-3 py-1 text-xs font-medium glass-effect bg-blue-600/85 text-white !border-0 h-[2rem]">
                  <span className="flex items-center gap-1">
                    <span className="text-lg">✓</span>
                    Verified
                  </span>
                </Badge>
              )}
              {artist.premium && (
                <Badge className="flex items-center gap-1 px-3 py-1 text-xs font-medium glass-effect bg-gradient-to-r from-amber-400 to-yellow-300 text-yellow-900 !border-0 h-[2rem]">
                  <span className="flex items-center gap-1">
                    <span className="text-lg">⭐</span>
                    Premium
                  </span>
                </Badge>
              )}
            </div>
            {/* Tagline */}
            {artist.tagline && (
              <div className="text-sm md:text-base text-slate-700/90 max-w-2xl break-words leading-relaxed font-normal mb-1">
                {artist.tagline}
              </div>
            )}
            {/* Tags */}
            {artist.tags && (
              <div className="flex flex-wrap gap-2 items-center my-1">
                {artist.tags.map((t: string) => (
                  <span
                    key={t}
                    className="
                      bg-gradient-to-r from-purple-200/60 to-blue-100/70
                      text-purple-900 px-3 py-0.5 rounded-full text-xs
                      shadow-sm
                      border border-purple-300/30
                      backdrop-blur-sm
                    "
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {/* Stats - soft glass, left-aligned on mobile, row on desktop */}
            <div className="w-full mt-3">
              <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 justify-start md:justify-between bg-gradient-to-tr from-white/80 via-purple-100/50 to-blue-50/60 rounded-xl shadow-sm px-3 py-2 backdrop-blur-[1.5px] border border-white/30">
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
        {/* Actions */}
        <div className="flex flex-col gap-2 items-stretch min-w-[210px] w-full md:w-auto max-w-md">
          <ArtistActionsBar
            isFollowing={isFollowing}
            onFollow={onFollow}
            onMessage={onMessage}
            onSave={onSave}
            onRequest={() => setShowRequestModal(true)}
            canRequest={!!artist.requestable}
          />
        </div>
      </div>
      {showRequestModal && (
        <RequestProjectModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          artist={artist}
        />
      )}
    </section>
  );
};

export default ArtistHeader;
