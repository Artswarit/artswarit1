
import React, { useState } from "react";
import ArtworkCard from "@/components/artwork/ArtworkCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, MapPin, Mail, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReviewCard from "@/components/reviews/ReviewCard";

interface GalleryArtwork {
  id: string;
  title: string;
  img: string;
  views: number;
  likes: number;
  price?: number;
  isPremium?: boolean;
  isExclusive?: boolean;
  type?: string;
  artistId?: string;
  artistName?: string;
  category?: string;
}

interface AboutDetails {
  artist: any;
  projectsCount: number;
  avgRating: number;
  reviewCount: number;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string | null;
  starting_price: number | null;
}

interface ReviewItem {
  id: string;
  client_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  clientName: string;
  clientAvatar: string | null;
  artist_response?: string | null;
  artist_response_at?: string | null;
}

interface ArtistTabsProps {
  allArt: GalleryArtwork[];
  premiumArt: GalleryArtwork[];
  exclusiveArt: GalleryArtwork[];
  pinnedIds?: string[];
  aboutDetails?: AboutDetails;
  services?: ServiceItem[];
  reviews?: ReviewItem[];
  onArtworkClick?: (art: GalleryArtwork) => void;
  isArtistOwner?: boolean;
  onRefreshReviews?: () => void;
  currentUserId?: string | null;
}

const PAGE_SIZE = 6;

const ART_TABS = ["all", "premium", "exclusive"];

const ArtistTabs: React.FC<ArtistTabsProps> = ({
  allArt,
  premiumArt,
  exclusiveArt,
  pinnedIds = [],
  aboutDetails,
  services = [],
  reviews = [],
  onArtworkClick,
  isArtistOwner = false,
  onRefreshReviews,
  currentUserId,
}) => {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);

  const { toast } = useToast();

  // Put pinned artworks at the top for "All"
  let allWithPinnedFirst = allArt;
  if (pinnedIds.length > 0 && allArt) {
    const pinned = allArt.filter((a) => pinnedIds.includes(a.id));
    const unpinned = allArt.filter((a) => !pinnedIds.includes(a.id));
    allWithPinnedFirst = [...pinned, ...unpinned];
  }

  const displayed: Record<string, GalleryArtwork[]> = {
    all: allWithPinnedFirst || [],
    premium: premiumArt || [],
    exclusive: exclusiveArt || [],
  };

  const isArtTab = ART_TABS.includes(tab);
  const paged = isArtTab && displayed[tab] ? displayed[tab].slice(0, PAGE_SIZE * page) : [];
  const hasMore = isArtTab && displayed[tab] && displayed[tab].length > PAGE_SIZE * page;

  // Form setup for Services tab
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: {
    title: "",
    description: "",
    budget: "",
  }});

  const submitRequest = () => {
    toast({
      title: "Project request sent!",
      description: "The artist will be notified of your interest.",
    });
    reset();
  };

  return (
    <div>
      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); }}>
        <div className="w-full overflow-x-auto pb-2 mb-2 -mx-1 px-1 flex justify-center">
          <TabsList className="bg-white/40 backdrop-blur rounded-2xl glass-effect w-full sm:w-max mb-2 py-1 px-1 min-w-max">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3">All Art</TabsTrigger>
            <TabsTrigger value="premium" className="text-xs sm:text-sm px-2 sm:px-3">Premium</TabsTrigger>
            <TabsTrigger value="exclusive" className="text-xs sm:text-sm px-2 sm:px-3">Exclusive</TabsTrigger>
            <TabsTrigger value="services" className="text-xs sm:text-sm px-2 sm:px-3">Services</TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-sm px-2 sm:px-3">About</TabsTrigger>
          </TabsList>
        </div>

        {/* "All Art", "Premium", "Exclusive" tabs */}
        <TabsContent value={tab} forceMount>
          {isArtTab && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 my-4">
                {paged.map((art) => (
                  <ArtworkCard
                    key={art.id}
                    id={art.id}
                    title={art.title}
                    artist={art.artistName || "Artist"}
                    artistId={art.artistId || ""}
                    type={art.type || "image"}
                    imageUrl={art.img}
                    likes={art.likes}
                    views={art.views}
                    price={art.price}
                    category={art.category}
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

          {/* Services Tab */}
          {tab === "services" && (
            <div className="my-6 max-w-2xl mx-auto">
              <h3 className="font-bold text-xl text-purple-900 mb-3 flex items-center gap-2">
                <Mail className="text-purple-500" size={22} />
                Services & Project Request
              </h3>

              {services.length === 0 ? (
                <div className="mb-7 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                  This artist hasn't listed fixed services yet. Send a project request below.
                </div>
              ) : (
                <div className="grid gap-4 mb-7">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 rounded-xl border bg-white/60 shadow flex flex-col md:flex-row justify-between items-start md:items-center"
                    >
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{service.title}</div>
                        {service.description && (
                          <div className="text-gray-700">{service.description}</div>
                        )}
                      </div>
                      {service.starting_price !== null && (
                        <div className="font-semibold text-amber-700 mt-2 md:mt-0 md:ml-4 flex items-center gap-0.5">
                          <IndianRupee className="h-4 w-4" />
                          {service.starting_price}+
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit(submitRequest)} className="bg-white/80 rounded-xl p-6 shadow space-y-4">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Project Title</label>
                  <Input placeholder="E.g. 'Custom Portrait'" required {...register("title")} />
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Project Description</label>
                  <Textarea placeholder="Describe what you want..." rows={4} required {...register("description")} />
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Budget (optional)</label>
                  <Input type="number" min={0} placeholder="Amount in ₹" {...register("budget")} />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-violet-600 text-white hover:bg-violet-700 font-semibold gap-2 flex items-center"
                >
                  <Mail size={17} />
                  {isSubmitting ? "Sending..." : "Send Request"}
                </Button>
              </form>
            </div>
          )}

          {/* Expanded "About" tab details */}
          {tab === "about" && aboutDetails && (
            <div className="my-8 px-2 max-w-xl mx-auto">
              <h3 className="font-bold text-xl text-purple-900 mb-2">
                {aboutDetails.artist.name}
              </h3>

              <div className="flex flex-col gap-2 mb-4 text-[15px]">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} className="text-purple-400" />
                  <span>{aboutDetails.artist.location || "Location not specified"}</span>
                </div>
                {aboutDetails.artist.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={18} className="text-blue-400" />
                    <a href={`mailto:${aboutDetails.artist.email}`} className="hover:underline">
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
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {aboutDetails.artist.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <span className="font-semibold text-gray-700 mr-2">Bio:</span>
                <span className="text-gray-800">{aboutDetails.artist.bio || "No bio available."}</span>
              </div>

              {/* Compute stats from reviews prop */}
              {(() => {
                const reviewCount = reviews.length;
                const avgRating = reviewCount > 0 
                  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
                  : 0;

                return (
                  <>
                    <div className="flex flex-wrap gap-x-7 gap-y-1 mb-4">
                      <div>
                        <span className="font-semibold text-gray-700">Projects Done: </span>
                        <span className="text-purple-900 font-bold">{aboutDetails.projectsCount}</span>
                      </div>
                      {avgRating > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-700">Avg. Rating:</span>
                          <span className="text-yellow-600 font-bold">{avgRating.toFixed(1)}</span>
                          <Star className="text-yellow-400 fill-yellow-400" size={20} />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-700">Reviews:</span>
                        <span className="ml-1 font-bold">{reviewCount}</span>
                      </div>
                    </div>

                    <hr className="my-4" />

                    <div className="mb-5">
                      <h4 className="font-semibold text-lg mb-3 text-purple-900">Client Reviews</h4>
                      {reviewCount === 0 ? (
                        <div className="bg-gray-50 rounded-lg px-5 py-4 border border-gray-200 text-center text-gray-500">
                          No reviews yet. Be the first to work with this artist!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.map((rev) => (
                            <ReviewCard
                              key={rev.id}
                              reviewId={rev.id}
                              clientId={rev.client_id}
                              clientName={rev.clientName}
                              clientAvatar={rev.clientAvatar}
                              rating={rev.rating}
                              reviewText={rev.review_text}
                              createdAt={rev.created_at}
                              artistResponse={rev.artist_response}
                              artistResponseAt={rev.artist_response_at}
                              isArtistOwner={isArtistOwner}
                              currentUserId={currentUserId}
                              onResponseAdded={onRefreshReviews}
                              onReviewUpdated={onRefreshReviews}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistTabs;


