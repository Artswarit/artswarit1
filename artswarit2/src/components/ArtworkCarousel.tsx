import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Eye, Heart } from "lucide-react";
import { usePublicArtworks } from "@/hooks/usePublicArtworks";
import { Skeleton } from "@/components/ui/skeleton";

const ArtworkCarousel = () => {
  const { artworks, loading } = usePublicArtworks();

  // Get top 6 artworks for carousel
  const featuredArtwork = artworks.slice(0, 6);

  if (loading) {
    return (
      <section id="artwork" className="py-20 bg-gradient-to-r from-violet-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="section-title">Featured Artwork</h2>
              <p className="section-subtitle">Explore stunning creations from our talented artists</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[450px] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredArtwork.length === 0) {
    return (
      <section id="artwork" className="py-20 bg-gradient-to-r from-violet-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="section-title">Featured Artwork</h2>
          <p className="section-subtitle mb-8">Be the first to upload your artwork!</p>
          <Button asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="artwork" className="py-20 bg-gradient-to-r from-violet-50 via-white to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-200/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-purple-200/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="section-title">Featured Artwork</h2>
            <p className="section-subtitle">
              Explore stunning creations from our talented artists
            </p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex border-primary hover:bg-primary hover:text-white transition-all duration-300">
            <Link to="/explore">View All Artwork</Link>
          </Button>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {featuredArtwork.map((artwork) => (
              <CarouselItem key={artwork.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                <Link to={`/artwork/${artwork.id}`} className="block h-full">
                  <div className="artwork-card group h-[450px] rounded-2xl overflow-hidden shadow-lg transition-all duration-500 neo-blur-sm relative">
                    {artwork.type === 'video' ? (
                      <video 
                        src={artwork.imageUrl} 
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <img 
                        src={artwork.imageUrl} 
                        alt={artwork.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-white text-2xl font-semibold">{artwork.title}</h3>
                      <Link 
                        to={`/artist/${artwork.artistId}`} 
                        className="text-gray-200 text-lg hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        by {artwork.artist}
                      </Link>
                      
                      {/* Stats display */}
                      <div className="flex items-center space-x-4 mt-3 text-gray-200">
                        <div className="flex items-center gap-1">
                          <Heart size={16} className="text-red-400" />
                          <span>{artwork.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={16} className="text-blue-400" />
                          <span>{artwork.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-white/80 backdrop-blur-md border border-white/30 text-primary hover:bg-white/90" />
          <CarouselNext className="right-2 bg-white/80 backdrop-blur-md border border-white/30 text-primary hover:bg-white/90" />
        </Carousel>
        
        <div className="mt-12 text-center md:hidden">
          <Button asChild variant="outline" className="border-primary hover:bg-primary hover:text-white transition-all duration-300">
            <Link to="/explore">View All Artwork</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ArtworkCarousel;
