
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
  // Make entire artwork image area clickable for full view
  return (
    <GlassCard
      className="glass-effect relative p-0 overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Do not attach onClick at GlassCard level to avoid accidental opens
    >
      <div
        className="relative aspect-[4/3] overflow-hidden w-full"
        style={{ cursor: "pointer" }}
        onClick={onViewFull}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${title}`}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onViewFull) {
            e.preventDefault();
            onViewFull();
          }
        }}
      >
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
                onClick={(e) => { e.stopPropagation(); if (onLike) onLike(); }}
                className={`rounded-full backdrop-blur px-2 py-1 bg-white/30 hover:bg-pink-200/70 text-pink-600 shadow-lg border-none transition flex items-center gap-1 ${isLiked ? "font-bold" : ""}`}
              >
                <Heart size={16} className={isLiked ? "fill-current" : ""} />
                {likes}
              </button>
              {downloadable && (
                <button
                  onClick={(e) => { e.stopPropagation(); if (onDownload) onDownload(); }}
                  className="rounded-full px-2 py-1 bg-white/40 hover:bg-white/70 text-blue-600 backdrop-blur transition shadow"
                >
                  <Download size={16} />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); if (onViewFull) onViewFull(); }}
                className="rounded-full px-2 py-1 bg-white/30 hover:bg-blue-300/80 text-blue-800 transition backdrop-blur shadow"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-2 sm:p-3 md:p-4 flex flex-col gap-1.5 sm:gap-2">
        <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">{title}</h4>
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-0.5 sm:gap-1">
            <Eye size={12} className="sm:w-[13px] sm:h-[13px]" /> <span className="text-[10px] sm:text-xs">{views}</span>
          </span>
          <span className="flex items-center gap-0.5 sm:gap-1">
            <Heart size={12} className="sm:w-[13px] sm:h-[13px]" /> <span className="text-[10px] sm:text-xs">{likes}</span>
          </span>
          {typeof price !== "undefined" && (
            <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold ml-auto flex-shrink-0 ${isPremium ? "bg-yellow-300/40 text-yellow-800" : "bg-blue-100 text-blue-700"}`}>
              {price === 0 ? "Free" : `₹${price}`}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ArtworkCardModern;

