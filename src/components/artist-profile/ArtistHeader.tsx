
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
        size={16}
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
  // Stats for dopamine effect - add mock rating
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
    {
      type: "rating",
      value: artist.rating ?? 4.7, // mock avg rating
      label: "Rating",
    },
  ];

  // Mock data for "All" section: projects, reviews, etc
  const artistAllDetails = {
    totalProjects: artist.totalProjects ?? 19,
    avgRating: artist.rating ?? 4.7,
    reviewCount: artist.reviewCount ?? 12,
  };

  return (
    <div className="relative w-full min-h-[400px] sm:min-h-[450px] flex flex-col">
      {/* Background with overlay - Mobile Responsive */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[1.5rem] sm:rounded-b-[2.5rem]">
        <img
          src={artist.cover}
          alt=""
          className="w-full h-full object-cover object-center scale-105 blur-sm opacity-70 transition-all duration-300"
          style={{ filter: "blur(5px)" }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      {/* Main Content - Mobile Responsive Layout */}
      <div className="relative w-full flex flex-col z-10 gap-6 p-4 sm:p-6 lg:p-10 pb-4">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-8">
          
          {/* Avatar + Info block - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 lg:gap-7 w-full lg:w-auto">
            {/* Avatar */}
            <div className="p-2 flex flex-col items-center justify-center shadow-xl rounded-2xl border-white/30 bg-white/60 shrink-0">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-full border-4 border-white object-cover shadow-md"
                style={{
                  aspectRatio: "1/1",
                  background: "white",
                }}
              />
            </div>
            
            {/* Info - Mobile Responsive */}
            <div className="flex flex-col gap-3 text-white text-center sm:text-left min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold font-heading drop-shadow-lg break-words">
                  {artist.name}
                </h1>
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  {artist.isVerified && (
                    <Badge className="bg-blue-600/90 text-white flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold border-2 border-white/40">
                      <Verified size={14} /> Verified
                    </Badge>
                  )}
                  {artist.premium && (
                    <span className="relative isolate inline-block">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold border-2 border-yellow-100/40 overflow-hidden relative border-0">
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
              </div>
              
              {/* Bio - Mobile Responsive */}
              <div className="text-sm sm:text-base text-white font-normal leading-relaxed">
                <div className="w-fit mx-auto sm:mx-0 bg-gray-900 bg-opacity-80 text-white px-3 sm:px-4 py-2 rounded-2xl shadow">
                  <span className="break-words">{artist.tagline || artist.category}</span>
                </div>
              </div>
              
              {/* Tags - Mobile Responsive */}
              <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
                {artist.tags &&
                  artist.tags.map((t: string) => (
                    <span
                      key={t}
                      className="bg-gradient-to-r from-purple-700 to-blue-700 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow border border-white/20"
                    >
                      {t}
                    </span>
                  ))}
              </div>
              
              {/* Stats - Mobile Responsive */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mt-3 px-3 py-2 bg-black/80 rounded-2xl shadow-lg max-w-full">
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
          
          {/* Actions - Mobile Responsive */}
          <div className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[320px]">
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
      
      {/* Artist Overview - Mobile Responsive */}
      <div className="relative w-full px-4 sm:px-6 lg:px-10 pt-3 z-10">
        <div className="bg-white rounded-2xl shadow-lg border p-4 sm:p-6 w-full max-w-3xl mx-auto lg:mx-0 lg:ml-32 xl:ml-48 mt-2">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Artist Overview</h3>
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-3">
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-bold text-blue-900">{artistAllDetails.totalProjects}</span>
              <span className="text-xs sm:text-sm text-gray-500">Projects Completed</span>
            </div>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-bold text-yellow-500">{artistAllDetails.avgRating.toFixed(1)}</span>
              <span className="text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-1">
                Avg. Rating
                <div className="hidden sm:flex">
                  <StarRating value={artistAllDetails.avgRating} />
                </div>
              </span>
            </div>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-bold text-pink-600">{artistAllDetails.reviewCount}</span>
              <span className="text-xs sm:text-sm text-gray-500">Client Reviews</span>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            This area gives clients a quick overview of the artist's performance and reputation on the platform.
            <br className="hidden sm:block" />
            <span className="font-semibold text-gray-900">Want more detail?</span> Use the "All" tab in the portfolio to explore everything!
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;
