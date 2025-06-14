
import React, { useState } from "react";
import ArtworkCardModern from "./ArtworkCardModern";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star } from "lucide-react";

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

interface AboutDetails {
  artist: any;
  projectsCount: number;
  avgRating: number;
  reviewCount: number;
}

interface ArtistTabsProps {
  allArt: GalleryArtwork[];
  premiumArt: GalleryArtwork[];
  exclusiveArt: GalleryArtwork[];
  pinnedIds?: string[];
  aboutDetails?: AboutDetails;
  onArtworkClick?: (art: GalleryArtwork) => void;
}

const PAGE_SIZE = 6;

const ArtistTabs: React.FC<ArtistTabsProps> = ({
  allArt,
  premiumArt,
  exclusiveArt,
  pinnedIds = [],
  aboutDetails,
  onArtworkClick,
}) => {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);

  // Put pinned artworks at the top for "All"
  let allWithPinnedFirst = allArt;
  if (pinnedIds.length > 0) {
    const pinned = allArt.filter((a) => pinnedIds.includes(a.id));
    const unpinned = allArt.filter((a) => !pinnedIds.includes(a.id));
    allWithPinnedFirst = [...pinned, ...unpinned];
  }

  const displayed = {
    all: allWithPinnedFirst,
    premium: premiumArt,
    exclusive: exclusiveArt,
  };

  const paged = tab === "all"
    ? displayed[tab].slice(0, PAGE_SIZE * page)
    : displayed[tab].slice(0, PAGE_SIZE * page);

  const hasMore = displayed[tab].length > PAGE_SIZE * page;

  return (
    <div>
      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); }}>
        <TabsList className="bg-white/40 backdrop-blur rounded-2xl glass-effect w-max mb-4 py-1 px-1">
          <TabsTrigger value="all">All Art</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="exclusive">Exclusive</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* "All Art", "Premium", "Exclusive" tabs */}
        <TabsContent value={tab} forceMount>
          {(tab === "all" || tab === "premium" || tab === "exclusive") && (
            <>
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
            </>
          )}

          {/* "About" tab details */}
          {tab === "about" && aboutDetails && (
            <div className="my-8 px-3">
              <h3 className="font-bold text-xl text-purple-900 mb-3">
                {aboutDetails.artist.name}
              </h3>
              <div className="text-gray-700 mb-3">
                <div>
                  <span className="font-semibold mr-2">Bio:</span>
                  {aboutDetails.artist.bio || "No bio available."}
                </div>
                <div className="mt-2">
                  <span className="font-semibold mr-2">Projects Completed:</span>
                  {aboutDetails.projectsCount}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-semibold">Avg. Rating:</span>
                  <span className="text-yellow-600 text-lg font-bold">
                    {aboutDetails.avgRating}
                  </span>
                  <Star className="text-yellow-400 fill-yellow-400" size={20} />
                </div>
                <div className="mt-2">
                  <span className="font-semibold mr-2">Client Reviews:</span>
                  {aboutDetails.reviewCount}
                </div>
                {/* Reviews placeholder */}
                <div className="mt-4">
                  <h4 className="font-semibold mb-1">Reviews</h4>
                  <ul className="list-disc pl-6 text-sm">
                    <li>Great artist! Very professional and timely. ⭐⭐⭐⭐⭐</li>
                    <li>One of the best collaborations I've had. Highly recommend.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default ArtistTabs;
