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

// Helper component to render stars visually
const StarRating = ({ value }: { value: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; ++i) {
    stars.push(
      <Star
        key={i}
        size={18}
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
  onSave,
  onRequest,
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
    <div className="relative w-full min-h-[330px] flex flex-col items-end md:items-center">
      {/* Background with simple dark overlay only */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem]">
        <img
          src={artist.cover}
          alt=""
          className="w-full h-full object-cover object-[center_30%] scale-105 blur-sm opacity-70 transition-all duration-300"
          style={{ filter: "blur(5px)" }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative w-full flex flex-col md:flex-row items-end md:items-center justify-between z-10 gap-6 p-4 md:p-10 pb-4">
        {/* Avatar + Info block */}
        <div className="flex items-end md:items-center gap-7">
          <div className="p-2 flex flex-col items-center justify-center shadow-xl rounded-2xl border-white/30 bg-white/60">
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
          {/* Info*/}
          <div className="flex flex-col gap-3 text-white md:text-left min-w-[220px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl md:text-5xl font-bold font-heading drop-shadow-lg">
                {artist.name}
              </h1>
              {artist.isVerified && (
                <Badge className="bg-blue-600/90 text-white flex items-center gap-1 px-3 py-1 text-[0.82rem] font-semibold border-2 border-white/40">
                  <Verified size={16} /> Verified
                </Badge>
              )}
              {artist.premium && (
                <Badge className="bg-gradient-to-r from-amber-400 to-yellow-300 text-yellow-900 flex items-center gap-1 px-3 py-1 text-[0.82rem] font-semibold border-2 border-yellow-100/40">
                  <Star size={16} /> Premium
                </Badge>
              )}
            </div>
            {/* Bio with solid, non-glass background */}
            <div className="text-[0.95rem] md:text-base text-white font-normal leading-relaxed max-w-md">
              <div className="w-fit bg-gray-900 bg-opacity-80 text-white px-4 py-2 rounded-2xl shadow">
                <span>{artist.tagline || artist.category}</span>
              </div>
            </div>
            {/* Tags with solid pill style */}
            <div className="flex flex-wrap gap-2 items-center mt-1">
              {artist.tags &&
                artist.tags.map((t: string) => (
                  <span
                    key={t}
                    className="bg-gradient-to-r from-purple-700 to-blue-700 text-white px-3 py-1 rounded-full text-xs shadow border border-white/20 font-semibold"
                  >
                    {t}
                  </span>
                ))}
            </div>
            {/* Dopamine trigger stats: NO glass, high contrast */}
            <div className="flex gap-4 mt-3 px-2 py-2 bg-black/80 rounded-2xl shadow-lg max-w-md">
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
      {/* ALL artist summary section (placeholder for 'All' details/analytics) */}
      <div className="relative w-full px-5 pt-3 md:px-10 z-10">
        <div className="bg-white rounded-2xl shadow-lg border p-5 max-w-2xl md:ml-48 mt-2">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Artist Overview</h3>
          <div className="flex flex-wrap gap-7 items-center mb-2">
            <div>
              <span className="block text-2xl font-bold text-blue-900">{artistAllDetails.totalProjects}</span>
              <span className="text-xs text-gray-500">Projects Completed</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-yellow-500">{artistAllDetails.avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">Avg. Rating <StarRating value={artistAllDetails.avgRating} /></span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-pink-600">{artistAllDetails.reviewCount}</span>
              <span className="text-xs text-gray-500">Client Reviews</span>
            </div>
          </div>
          {/* In a real app, map reviews, stats, etc */}
          <div className="mt-3 text-sm text-gray-700">
            This area gives clients a quick overview of the artist's performance and reputation on the platform.<br />
            <span className="font-semibold text-gray-900">Want more detail?</span> Use the "All" tab in the portfolio to explore everything!
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;
