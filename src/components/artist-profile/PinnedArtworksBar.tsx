
import React from "react";
import ArtworkCardModern from "./ArtworkCardModern";

interface PinnedArtworksBarProps {
  artworks: any[];
  onArtworkClick?: (artwork: any) => void;
}

const PinnedArtworksBar: React.FC<PinnedArtworksBarProps> = ({
  artworks,
  onArtworkClick,
}) => {
  if (!artworks || artworks.length === 0) return null;
  return (
    <div className="w-full mx-auto mb-6">
      <h3 className="font-heading text-xl md:text-2xl mb-2 font-semibold text-gray-900">Pinned Artworks</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {artworks.map((art, i) => (
          <div key={art.id} className="min-w-[230px] max-w-[300px]">
            <ArtworkCardModern
              {...art}
              onViewFull={() => onArtworkClick?.(art)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedArtworksBar;
