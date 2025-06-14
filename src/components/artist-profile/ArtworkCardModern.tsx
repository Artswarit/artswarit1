
import React, { useState } from "react";
import GlassCard from "@/components/ui/glass-card";
import { Eye, Heart, Download, Lock, ExternalLink } from "lucide-react";

interface ArtworkCardProps {
  title: string;
  img: string;
  views: number;
  likes: number;
  price?: number | null;
  isPremium?: boolean;
  isExclusive?: boolean;
  onLike?: () => void;
  isLiked?: boolean;
  onViewFull?: () => void;
  downloadable?: boolean;
  onDownload?: () => void;
}

const ArtworkCardModern: React.FC<ArtworkCardProps> = ({
  title,
  img,
  views,
  likes,
  price,
  isPremium,
  isExclusive,
  isLiked,
  onLike,
  onViewFull,
  downloadable,
  onDownload,
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <GlassCard
      className="glass-effect relative p-0 overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden w-full">
        <img
          src={img}
          alt={title}
          className="object-cover w-full h-full transition-all duration-300 group-hover:scale-105"
        />
        {/* Overlays */}
        {/* Premium/Exclusive Overlay */}
        {(isPremium || isExclusive) && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 bg-yellow-200/80 text-yellow-800 font-semibold rounded-md px-2 py-0.5 text-xs shadow">
              <Lock size={15} /> {isPremium ? "Premium" : "Exclusive"}
            </span>
          </div>
        )}
        {hovered && (
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-200">
            {/* Quick actions */}
            <div className="flex justify-end p-2 gap-2">
              <button
                onClick={onLike}
                className={`rounded-full backdrop-blur px-2 py-1 bg-white/30 hover:bg-pink-200/70 text-pink-600 shadow-lg border-none transition flex items-center gap-1 ${isLiked ? "font-bold" : ""}`}
              >
                <Heart size={16} className={isLiked ? "fill-current" : ""} />
                {likes}
              </button>
              {downloadable && (
                <button
                  onClick={onDownload}
                  className="rounded-full px-2 py-1 bg-white/40 hover:bg-white/70 text-blue-600 backdrop-blur transition shadow"
                >
                  <Download size={16} />
                </button>
              )}
              <button
                onClick={onViewFull}
                className="rounded-full px-2 py-1 bg-white/30 hover:bg-blue-300/80 text-blue-800 transition backdrop-blur shadow"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col gap-2">
        <h4 className="font-medium text-base text-gray-900 truncate">{title}</h4>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Eye size={13} /> {views}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={13} /> {likes}
          </span>
          {typeof price !== "undefined" && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ml-auto ${isPremium ? "bg-yellow-300/40 text-yellow-800" : "bg-blue-100 text-blue-700"}`}>
              {price === 0 ? "Free" : `₹${price}`}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ArtworkCardModern;
