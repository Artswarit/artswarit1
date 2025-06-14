
import React, { useState } from "react";
import ArtworkCardModern from "./ArtworkCardModern";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface GalleryArtwork {
  id: string;
  title: string;
  img: string;
  views: number;
  likes: number;
  price?: number;
  isPremium?: boolean;
  isExclusive?: boolean;
}

interface ArtistTabsProps {
  allArt: GalleryArtwork[];
  premiumArt: GalleryArtwork[];
  exclusiveArt: GalleryArtwork[];
  pinnedIds?: string[];
  onArtworkClick?: (art: GalleryArtwork) => void;
}

const PAGE_SIZE = 6;

const ArtistTabs: React.FC<ArtistTabsProps> = ({
  allArt,
  premiumArt,
  exclusiveArt,
  onArtworkClick,
}) => {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);

  const displayed = {
    all: allArt,
    premium: premiumArt,
    exclusive: exclusiveArt,
  };

  // Pagination logic
  const paged = displayed[tab].slice(0, PAGE_SIZE * page);
  const hasMore = displayed[tab].length > PAGE_SIZE * page;

  return (
    <div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/40 backdrop-blur rounded-2xl glass-effect w-max mb-4 py-1 px-1">
          <TabsTrigger value="all">All Art</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="exclusive">Exclusive</TabsTrigger>
        </TabsList>
        {/* Tab artwork galleries */}
        <TabsContent value={tab} forceMount>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-4">
            {paged.map((art) => (
              <ArtworkCardModern
                key={art.id}
                {...art}
                onViewFull={() => onArtworkClick?.(art)}
              />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setPage(page + 1)}
                className="bg-white/60 hover:bg-white/80 text-purple-700 px-5 py-2 rounded-lg shadow font-semibold"
              >
                Load more
              </button>
            </div>
          )}
          {paged.length === 0 && (
            <div className="text-muted-foreground text-center py-10">
              No art in this section.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default ArtistTabs;
