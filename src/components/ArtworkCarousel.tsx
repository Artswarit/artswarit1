
import { useRef } from "react";
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

// Enhanced mock data for featured artwork with likes and views
const featuredArtwork = [
  {
    id: "1",
    title: "Abstract Harmony",
    artist: "Alex Rivera",
    artistId: "1",
    imageUrl: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    likes: 243,
    views: 1862,
  },
  {
    id: "2",
    title: "Urban Poetry",
    artist: "Maya Johnson",
    artistId: "2",
    imageUrl: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    likes: 187,
    views: 1253,
  },
  {
    id: "3",
    title: "Music Flow",
    artist: "Jordan Smith",
    artistId: "3",
    imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    likes: 329,
    views: 2451,
  },
  {
    id: "4",
    title: "Digital Dreams",
    artist: "Taylor Reed",
    artistId: "4",
    imageUrl: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    likes: 156,
    views: 983,
  },
  {
    id: "5",
    title: "Futuristic Melodies",
    artist: "Emma Williams",
    artistId: "5",
    imageUrl: "https://images.unsplash.com/photo-1614173188975-0e2aae485595?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    likes: 274,
    views: 1764,
  },
];

// Helper function for scrolling
const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
  e.preventDefault();
  const section = document.getElementById(sectionId);
  if (section) {
    setTimeout(() => {
      const yOffset = -80; // 80px offset for navbar
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, 100);
  }
};

const ArtworkCarousel = () => {
  const carouselRef = useRef(null);

  return (
    <section id="artwork" className="py-20 bg-gradient-to-r from-violet-50 via-white to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"></div>
        {/* Enhanced background elements */}
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
                <Link to={`/artist/${artwork.artistId}`} className="block h-full">
                  <div className="artwork-card group h-[450px] rounded-2xl overflow-hidden shadow-lg transition-all duration-500 neo-blur-sm relative">
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-white text-2xl font-semibold">{artwork.title}</h3>
                      <p className="text-gray-200 text-lg">by {artwork.artist}</p>
                      
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
