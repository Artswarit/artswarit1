
import React, { useState } from "react";
import ArtworkCardModern from "./ArtworkCardModern";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PinnedArtworksBarProps {
  artworks: any[];
  onArtworkClick?: (artwork: any) => void;
}

const PinnedArtworksBar: React.FC<PinnedArtworksBarProps> = ({
  artworks,
  onArtworkClick,
}) => {
  if (!artworks || artworks.length === 0) return null;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <TooltipProvider>
      <div className="w-full mx-auto mb-6">
        <h3 className="font-heading text-lg sm:text-xl md:text-2xl mb-3 font-semibold text-gray-900 px-1">
          Pinned Artworks
        </h3>
        <div className="w-full px-1">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-200">
            {artworks.map((art, i) => (
              <div
                key={art.id}
                className={`min-w-[215px] max-w-[320px] snap-start flex-1 transition-transform ${hoveredId === art.id ? "scale-105 z-30" : ""
                  } group relative`}
                style={{ flex: "0 0 auto" }}
                onMouseEnter={() => setHoveredId(art.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative">
                  {/* Artwork Thumbnail */}
                  <img
                    src={art.img || art.imageUrl}
                    alt={art.title}
                    className="rounded-2xl w-full aspect-[4/3] object-cover border border-white/60 shadow-md"
                  />
                  {/* Premium badge/lock */}
                  {art.isPremium && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute top-2 right-2 bg-yellow-300/90 rounded-full px-2 py-1 flex items-center text-yellow-900 shadow font-bold text-xs gap-1 border border-yellow-400">
                          <span className="text-base">🔒</span> Premium
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        This is a premium artwork. Subscribe to view.
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {/* Hover overlay for stats & view button */}
                  <div className={`absolute inset-0 flex flex-col justify-between rounded-2xl transition-opacity duration-150 ${hoveredId === art.id ? "opacity-100 bg-black/50" : "opacity-0 pointer-events-none"} z-10`}>
                    <div className="flex justify-end p-2 gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onArtworkClick?.(art)}
                            className="rounded-full p-2 bg-white/90 hover:bg-white text-blue-700 transition shadow"
                            title="View full"
                          >
                            <span className="text-lg">🔍</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Open in full view</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex flex-col items-start gap-2 p-3">
                      <div className="flex items-center gap-2 text-xs text-white font-medium drop-shadow mb-1">
                        <span className="flex items-center gap-1"><span>👁</span>{art.views ?? "--"}</span>
                        <span className="flex items-center gap-1"><span>♥</span>{art.likes ?? "--"}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(art.tags || []).map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-white/25 text-white px-2 py-0.5 rounded-full text-xs border border-white/30 backdrop-blur-sm shadow"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Card below image */}
                <div className="mt-2">
                  <ArtworkCardModern
                    {...art}
                    onViewFull={() => onArtworkClick?.(art)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PinnedArtworksBar;
