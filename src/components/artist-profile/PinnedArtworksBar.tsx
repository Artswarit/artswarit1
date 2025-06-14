
import React from "react";
import ArtworkCardModern from "./ArtworkCardModern";

interface PinnedArtworksBarProps {
  artworks: any[];
  onArtworkClick?: (artwork: any) => void;
}

/**
 * Responsive, glass-styled pinned artworks bar with scroll and consistent spacing.
 */
const PinnedArtworksBar: React.FC<PinnedArtworksBarProps> = ({
  artworks,
  onArtworkClick,
}) => {
  if (!artworks || artworks.length === 0) return null;
  return (
    <div className="w-full mx-auto mb-6">
      <h3 className="font-heading text-lg sm:text-xl md:text-2xl mb-3 font-semibold text-gray-900 px-1">
        Pinned Artworks
      </h3>
      <div className="w-full px-1">
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-200">
          {artworks.map((art, i) => (
            <div
              key={art.id}
              className="min-w-[210px] max-w-[330px] snap-start flex-1"
              style={{ flex: "0 0 auto" }}
            >
              <ArtworkCardModern
                {...art}
                onViewFull={() => onArtworkClick?.(art)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PinnedArtworksBar;
