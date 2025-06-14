
import React, { useState } from "react";
import GlassCard from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import StatCard from "./StatCard";
import ArtistActionsBar from "./ArtistActionsBar";
import { Verified, Star } from "lucide-react";
import RequestProjectModal from "./RequestProjectModal";

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

  const canRequestProject = artist?.requestable !== false;
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <section className="relative w-full flex flex-col items-center pb-3 md:pb-0">
      {/* Background cover image */}
      <div className="absolute inset-0 overflow-hidden rounded-b-2xl pointer-events-none z-0">
        <img
          src={artist.cover}
          alt=""
          className="w-full h-full object-cover object-center scale-[1.01] blur-[1.5px] md:blur-[2px] opacity-[0.70] transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-purple-900/10 to-blue-100/20" />
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-7 md:gap-6 mx-auto z-10 pt-6 md:pt-14 px-2 sm:px-4">
        {/* Avatar & Info Card */}
        <GlassCard className="flex flex-col md:flex-row items-center gap-7 px-7 py-6 md:px-12 md:py-8 w-full max-w-3xl glass-effect shadow-2xl rounded-2xl border border-white/30 bg-white/45 backdrop-blur-[6px]">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white shadow-xl bg-gradient-to-tr from-slate-100/90 to-slate-200/80 overflow-hidden">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-full h-full object-cover rounded-full"
                style={{ aspectRatio: "1/1" }}
              />
            </div>
          </div>
          {/* Textual info */}
          <div className="flex-1 flex flex-col justify-center min-w-[140px] w-full">
            {/* Name, badges, and tagline */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-wrap gap-2 items-center mb-1">
                <h1 className="text-2xl md:text-4xl font-bold font-heading text-slate-900 pr-1">
                  {artist.name}
                </h1>
                {artist.isVerified && (
                  <Badge variant="verified" className="flex items-center gap-1 duration-100 px-2.5 py-0.5 text-xs md:text-sm">
                    <Verified className="w-4 h-4 inline" /> Verified
                  </Badge>
                )}
                {artist.premium && (
                  <Badge variant="premium" className="flex items-center gap-1 px-2.5 py-0.5 text-xs md:text-sm">
                    <Star className="w-4 h-4 inline" /> Premium
                  </Badge>
                )}
              </div>
              {artist.tagline && (
                <div className="text-[15px] sm:text-base text-gray-700/90 max-w-2xl leading-normal font-normal mb-1">
                  {artist.tagline}
                </div>
              )}
            </div>
            {/* Tags */}
            {artist.tags && (
              <div className="flex flex-wrap gap-2 items-center my-1">
                {artist.tags.map((t: string) => (
                  <span
                    key={t}
                    className="bg-white/60 border border-slate-200 shadow-sm px-3 py-0.5 rounded-full text-xs text-purple-800 font-semibold backdrop-blur-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {/* Stats */}
            <div className="w-full mt-2 flex">
              <div className="flex flex-row gap-5 w-full">
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
        <div className="flex flex-col gap-3 items-stretch min-w-[206px] w-full md:w-auto max-w-md">
          <ArtistActionsBar
            isFollowing={isFollowing}
            onFollow={onFollow}
            onMessage={onMessage}
            onSave={onSave}
            onRequest={() => setShowRequestModal(true)}
            canRequest={canRequestProject}
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
