
import React, { useState } from "react";
import ArtworkCardModern from "./ArtworkCardModern";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, MapPin, Mail } from "lucide-react";

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

const ART_TABS = ["all", "premium", "exclusive"];

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
  if (pinnedIds.length > 0 && allArt) {
    const pinned = allArt.filter((a) => pinnedIds.includes(a.id));
    const unpinned = allArt.filter((a) => !pinnedIds.includes(a.id));
    allWithPinnedFirst = [...pinned, ...unpinned];
  }

  const displayed = {
    all: allWithPinnedFirst || [],
    premium: premiumArt || [],
    exclusive: exclusiveArt || [],
  };

  // Only compute paged and hasMore for artworks tabs
  const isArtTab = ART_TABS.includes(tab);
  const paged = isArtTab ? displayed[tab].slice(0, PAGE_SIZE * page) : [];
  const hasMore = isArtTab && displayed[tab].length > PAGE_SIZE * page;

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
          {isArtTab && (
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

          {/* Expanded "About" tab details with more info and top review */}
          {tab === "about" && aboutDetails && (
            <div className="my-8 px-2 max-w-xl mx-auto">
              <h3 className="font-bold text-xl text-purple-900 mb-2">
                {aboutDetails.artist.name}
              </h3>

              {/* Key profile info */}
              <div className="flex flex-col gap-2 mb-4 text-[15px]">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} className="text-purple-400" />
                  <span>
                    {aboutDetails.artist.location || "Location not specified"}
                  </span>
                </div>
                {aboutDetails.artist.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={18} className="text-blue-400" />
                    <a 
                      href={`mailto:${aboutDetails.artist.email}`}
                      className="hover:underline"
                    >
                      {aboutDetails.artist.email}
                    </a>
                  </div>
                )}
                {aboutDetails.artist.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-semibold">Website:</span>
                    <a
                      href={aboutDetails.artist.website}
                      className="text-blue-700 hover:underline"
                      target="_blank" rel="noopener noreferrer"
                    >
                      {aboutDetails.artist.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="mb-3">
                <span className="font-semibold text-gray-700 mr-2">Bio:</span>
                <span className="text-gray-800">{aboutDetails.artist.bio || "No bio available."}</span>
              </div>

              {/* Projects, rating, review count */}
              <div className="flex flex-wrap gap-x-7 gap-y-1 mb-4">
                <div>
                  <span className="font-semibold text-gray-700">Projects Done: </span>
                  <span className="text-purple-900 font-bold">
                    {aboutDetails.projectsCount}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-700">Avg. Rating:</span>
                  <span className="text-yellow-600 font-bold">
                    {aboutDetails.avgRating?.toFixed(1) || "—"}
                  </span>
                  <Star className="text-yellow-400 fill-yellow-400" size={20} />
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Reviews:</span>
                  <span className="ml-1 font-bold">
                    {aboutDetails.reviewCount}
                  </span>
                </div>
              </div>

              <hr className="my-4" />

              {/* Featured Top Review (demo, adjust for real data) */}
              <div className="mb-5">
                <h4 className="font-semibold text-lg mb-1 text-purple-900">Top Client Review</h4>
                <div className="bg-purple-50 rounded-lg px-5 py-4 border border-purple-100 shadow flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-1">
                    {/* Demo avatar */}
                    <img
                      src="https://randomuser.me/api/portraits/women/50.jpg"
                      alt="Client"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-semibold text-sm text-purple-700">Priya Patel</span>
                    <span className="flex gap-0.5 ml-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </span>
                  </div>
                  <p className="text-gray-700 italic">
                    "Absolutely phenomenal artist! Exceeded our expectations with every project.
                    Great communication and high professionalism. Will collaborate again!"
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    — Client, Apr 2025
                  </div>
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
