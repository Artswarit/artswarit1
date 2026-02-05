
import React, { useState } from "react";
import GlassCard from "@/components/ui/glass-card";
import { Eye, Heart, Download, Lock, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

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
  isUnlocked?: boolean;
  onUnlock?: () => void;
  onRequestAccess?: () => void;
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
  isUnlocked = false,
  onUnlock,
  onRequestAccess,
}) => {
  const [hovered, setHovered] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const { format: formatCurrency } = useCurrencyFormat();

  // Determine if content should be blurred
  const shouldBlur = (isPremium || isExclusive) && !isUnlocked;
  const blurIntensity = isExclusive ? "blur-xl" : "blur-md";

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnlock) {
      setShowUnlockAnimation(true);
      onUnlock();
      // Animation completes after unlock
      setTimeout(() => setShowUnlockAnimation(false), 600);
    }
  };

  const handleRequestAccess = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRequestAccess) {
      onRequestAccess();
    }
  };

  return (
    <GlassCard
      className="glass-effect relative p-0 overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden w-full"
        style={{ cursor: shouldBlur ? "default" : "pointer" }}
        onClick={!shouldBlur ? onViewFull : undefined}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${title}`}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onViewFull && !shouldBlur) {
            e.preventDefault();
            onViewFull();
          }
        }}
      >
        {/* Artwork Image with conditional blur */}
        <img
          src={img}
          alt={title}
          className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-105 ${
            shouldBlur ? blurIntensity : ''
          } ${showUnlockAnimation ? 'blur-0 scale-105' : ''}`}
        />

        {/* Lock Overlay for Premium/Exclusive */}
        {shouldBlur && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className={`p-3 rounded-full ${
              isExclusive 
                ? 'bg-purple-500/90 shadow-lg shadow-purple-500/30' 
                : 'bg-yellow-500/90 shadow-lg shadow-yellow-500/30'
            } mb-3`}>
              <Lock className="w-6 h-6 text-white" />
            </div>
            
            {/* Premium: Show price and unlock button */}
            {isPremium && !isExclusive && (
              <div className="text-center px-4">
                <p className="text-white font-semibold text-sm mb-2">
                  {formatCurrency(price)} to Unlock
                </p>
                <Button 
                  onClick={handleUnlock}
                  size="sm" 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Unlock Now
                </Button>
              </div>
            )}

            {/* Exclusive: Request access button (no price shown) */}
            {isExclusive && (
              <div className="text-center px-4">
                <p className="text-white/90 text-xs mb-2">
                  Exclusive Content
                </p>
                <Button 
                  onClick={handleRequestAccess}
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Request Access
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Unlocked Animation Overlay */}
        {showUnlockAnimation && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 animate-pulse">
            <div className="text-white font-bold text-lg flex items-center gap-2 bg-green-600/90 px-4 py-2 rounded-full shadow-xl">
              <Sparkles className="w-5 h-5" />
              Unlocked!
            </div>
          </div>
        )}

        {/* Premium/Exclusive Badge */}
        {(isPremium || isExclusive) && (
          <div className="absolute top-2 right-2 z-10">
            <span className={`flex items-center gap-1 font-semibold rounded-md px-2 py-0.5 text-xs shadow ${
              isExclusive 
                ? 'bg-purple-200/90 text-purple-800' 
                : 'bg-yellow-200/90 text-yellow-800'
            }`}>
              <Lock size={13} /> {isExclusive ? "Exclusive" : "Premium"}
            </span>
          </div>
        )}

        {/* Hover actions - only show for free or unlocked content */}
        {hovered && !shouldBlur && (
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-200">
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
          {/* Show price for Premium, "Request" for Exclusive, "Free" for free */}
          <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold ml-auto flex-shrink-0 ${
            isExclusive 
              ? "bg-purple-100 text-purple-700" 
              : isPremium 
                ? "bg-yellow-300/40 text-yellow-800" 
                : "bg-green-100 text-green-700"
          }`}>
            {isExclusive 
              ? "Request Access" 
              : isPremium 
                ? formatCurrency(price)
                : "Free"}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

export default ArtworkCardModern;
