
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
  isSaved: boolean;
  onSave: () => void;
  onRequest: () => void;
  loadingFollow: boolean;
  loadingSave: boolean;
};

// Helper component to render stars visually
const StarRating = ({ value }: { value: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; ++i) {
    stars.push(
      <Star
        key={i}
        size={14}
        className={`mr-0.5 ${
          value >= i ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
        strokeWidth={1.5}
        fill={value >= i ? "#facc15" : "none"}
      />
    );
  }
  return <div className="flex">{stars}</div>;
};

const ArtistHeader: React.FC<Props> = ({
  artist,
  onFollow,
  isFollowing,
  onMessage,
  isSaved,
  onSave,
  onRequest,
  loadingFollow,
  loadingSave,
}) => {
  // Stats for dopamine effect - use real data
  const stats = [
    {
      type: "followers",
      value: artist.followers ?? 0,
      label: "Followers",
    },
    {
      type: "likes",
      value: artist.likes ?? 0,
      label: "Likes",
    },
    {
      type: "views",
      value: artist.views ?? 0,
      label: "Views",
    },
    {
      type: "rating",
      value: artist.rating ?? 0,
      label: "Rating",
    },
  ];

  // Use real data for artist overview - no mock fallbacks
  const artistAllDetails = {
    totalProjects: artist.totalProjects ?? 0,
    avgRating: artist.rating ?? 0,
    reviewCount: artist.reviewCount ?? 0,
  };

  return (
    <div className="relative w-full min-h-[280px] sm:min-h-[320px] lg:min-h-[380px] flex flex-col">
      {/* Background with simple dark overlay only */}
      <div className="absolute inset-0 overflow-hidden rounded-b-xl sm:rounded-b-2xl lg:rounded-b-[2.5rem]">
        <img
          src={artist.cover}
          alt=""
          className="w-full h-full object-cover object-center scale-105 blur-sm opacity-70 transition-all duration-300"
          style={{ filter: "blur(5px)" }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      <div className="relative w-full flex flex-col z-10 gap-4 p-3 sm:p-6 lg:p-10 pb-3 sm:pb-4">
        {/* Mobile-first layout: Stack everything vertically on small screens */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-7 w-full">
          {/* Avatar + Info block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-7 w-full sm:w-auto">
            <div className="p-1.5 sm:p-2 flex flex-col items-center justify-center shadow-xl rounded-xl sm:rounded-2xl border-white/30 bg-white/60">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-full border-2 sm:border-4 border-white object-cover shadow-md"
                style={{
                  aspectRatio: "1/1",
                  background: "white",
                }}
              />
            </div>
            
            {/* Info - Centered on mobile, left-aligned on desktop */}
            <div className="flex flex-col gap-2 sm:gap-3 text-white text-center sm:text-left min-w-0 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl lg:text-5xl font-bold font-heading drop-shadow-lg">
                  {artist.name}
                </h1>
                {artist.isVerified && (
                  <Badge className="bg-blue-600/90 text-white flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold border border-white/40">
                    <Verified size={14} /> Verified
                  </Badge>
                )}
                {artist.premium && (
                  <span className="relative isolate inline-block">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold border border-yellow-100/40 overflow-hidden relative">
                      <Star size={14} /> Premium
                      <span
                        className="pointer-events-none absolute left-0 top-0 h-full w-full z-10"
                        aria-hidden="true"
                      >
                        <span className="absolute left-[-60%] top-0 h-full w-[80%] bg-gradient-to-r from-transparent via-white/60 to-transparent blur-[2px] opacity-60 animate-[shine-move_1.5s_linear_infinite]" />
                      </span>
                    </Badge>
                    <style>
                      {`
@keyframes shine-move {
  0% { left: -60%; }
  100% { left: 110%; }
}
                      `}
                    </style>
                  </span>
                )}
              </div>
              
              {/* Bio with solid, non-glass background */}
              <div className="text-sm sm:text-base text-white font-normal leading-relaxed">
                <div className="w-fit mx-auto sm:mx-0 bg-gray-900 bg-opacity-80 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow">
                  <span>{artist.tagline || artist.category}</span>
                </div>
              </div>
              
              {/* Tags with solid pill style */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center justify-center sm:justify-start mt-1">
                {artist.tags &&
                  artist.tags.map((t: string) => (
                    <span
                      key={t}
                      className="bg-gradient-to-r from-purple-700 to-blue-700 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs shadow border border-white/20 font-semibold"
                    >
                      {t}
                    </span>
                  ))}
              </div>
              
              {/* Dopamine trigger stats: NO glass, high contrast */}
              <div className="flex gap-2 sm:gap-4 mt-2 sm:mt-3 px-2 py-1.5 sm:px-2 sm:py-2 bg-black/80 rounded-xl sm:rounded-2xl shadow-lg max-w-full overflow-x-auto">
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
          
          {/* Actions - Full width on mobile, fixed width on desktop */}
          <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[230px]">
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
        </div>
      </div>
      
      {/* Artist summary section - Responsive positioning */}
      <div className="relative w-full px-3 sm:px-5 lg:px-10 pt-2 sm:pt-3 z-10">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border p-3 sm:p-5 w-full sm:max-w-2xl sm:ml-0 lg:ml-48 mt-1 sm:mt-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Artist Overview</h3>
          <div className="flex flex-wrap gap-4 sm:gap-7 items-center mb-2">
            <div className="text-center sm:text-left">
              <span className="block text-xl sm:text-2xl font-bold text-blue-900">{artistAllDetails.totalProjects}</span>
              <span className="text-xs text-gray-500">Projects Completed</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="block text-xl sm:text-2xl font-bold text-yellow-500">{artistAllDetails.avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                Avg. Rating <StarRating value={artistAllDetails.avgRating} />
              </span>
            </div>
            <div className="text-center sm:text-left">
              <span className="block text-xl sm:text-2xl font-bold text-pink-600">{artistAllDetails.reviewCount}</span>
              <span className="text-xs text-gray-500">Client Reviews</span>
            </div>
          </div>
          <div className="mt-3 text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            This area gives clients a quick overview of the artist's performance and reputation on the platform.<br />
            <span className="font-semibold text-gray-900">Want more detail?</span> Use the "All" tab in the portfolio to explore everything!
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;
