
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Filter, Eye, Heart, Shield, AlertTriangle } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Mock data for artwork (expanded with AI detection status)
const allArtwork = [
  {
    id: "1",
    title: "Abstract Harmony",
    artist: "Alex Rivera",
    artistId: "1",
    category: "Abstract",
    medium: "Digital",
    artistType: "Musician",
    imageUrl: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    likes: 243,
    views: 1862,
    price: 450,
    year: 2023,
    aiDetected: false,
    aiConfidence: 0.15,
    verified: true
  }, 
  {
    id: "2",
    title: "Urban Poetry",
    artist: "Maya Johnson",
    artistId: "2",
    category: "Urban",
    medium: "Oil",
    artistType: "Writer",
    imageUrl: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    likes: 187,
    views: 1253,
    price: 350,
    year: 2022,
    aiDetected: true,
    aiConfidence: 0.85,
    verified: false
  }, 
  {
    id: "3",
    title: "Music Flow",
    artist: "Jordan Smith",
    artistId: "3",
    category: "Abstract",
    medium: "Acrylic",
    artistType: "Rapper",
    imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    likes: 329,
    views: 2451,
    price: 550,
    year: 2023,
    aiDetected: false,
    aiConfidence: 0.25,
    verified: true
  }, 
  {
    id: "4",
    title: "Digital Dreams",
    artist: "Taylor Reed",
    artistId: "4",
    category: "Digital",
    medium: "Digital",
    artistType: "Editor",
    imageUrl: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    likes: 156,
    views: 983,
    price: 300,
    year: 2021,
    aiDetected: true,
    aiConfidence: 0.78,
    verified: false
  }, 
  {
    id: "5",
    title: "Futuristic Melodies",
    artist: "Emma Williams",
    artistId: "5",
    category: "Futuristic",
    medium: "Mixed Media",
    artistType: "Photographer",
    imageUrl: "https://images.unsplash.com/photo-1614173188975-0e2aae485595?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    likes: 274,
    views: 1764,
    price: 480,
    year: 2023,
    aiDetected: false,
    aiConfidence: 0.12,
    verified: true
  }, 
  {
    id: "6",
    title: "Ocean Depths",
    artist: "Alex Rivera",
    artistId: "1",
    category: "Nature",
    medium: "Watercolor",
    artistType: "Musician",
    imageUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    likes: 412,
    views: 2891,
    price: 680,
    year: 2022,
    aiDetected: false,
    aiConfidence: 0.08,
    verified: true
  }, 
  {
    id: "7",
    title: "Neon City",
    artist: "Maya Johnson",
    artistId: "2",
    category: "Urban",
    medium: "Digital",
    artistType: "Writer",
    imageUrl: "https://images.unsplash.com/photo-1549740425-5e9ed4d8cd34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    likes: 382,
    views: 2176,
    price: 520,
    year: 2023,
    aiDetected: true,
    aiConfidence: 0.92,
    verified: false
  }, 
  {
    id: "8",
    title: "Golden Hour",
    artist: "Jordan Smith",
    artistId: "3",
    category: "Landscape",
    medium: "Oil",
    artistType: "Rapper",
    imageUrl: "https://images.unsplash.com/photo-1548263594-a71ea65a8598?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1176&q=80",
    likes: 276,
    views: 1654,
    price: 490,
    year: 2021,
    aiDetected: false,
    aiConfidence: 0.18,
    verified: true
  }
];

// Categories for filtering
const categories = ["All", "Abstract", "Urban", "Digital", "Futuristic", "Nature", "Landscape"];

// Artist types for filtering
const artistTypes = ["All", "Musician", "Writer", "Rapper", "Editor", "Photographer", "Illustrator", "Voice Artist", "Animator", "Dancer", "Singer", "Scriptwriter"];

// Mediums for filtering
const mediums = ["All", "Digital", "Oil", "Acrylic", "Watercolor", "Mixed Media"];

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Explore = () => {
  const query = useQuery();
  const categoryParam = query.get("category");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "All");
  const [selectedArtistType, setSelectedArtistType] = useState("All");
  const [selectedMedium, setSelectedMedium] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [aiFilter, setAiFilter] = useState("all"); // all, verified-only, ai-flagged, human-only
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState("carousel"); // carousel, grid

  // Filter artwork based on all criteria
  const filteredArtwork = allArtwork.filter(artwork => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          artwork.artist.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          artwork.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || artwork.category === selectedCategory;
    const matchesArtistType = selectedArtistType === "All" || artwork.artistType === selectedArtistType;
    const matchesMedium = selectedMedium === "All" || artwork.medium === selectedMedium;
    const matchesPrice = artwork.price >= priceRange[0] && artwork.price <= priceRange[1];
    
    // AI Detection Filter
    let matchesAiFilter = true;
    switch (aiFilter) {
      case "verified-only":
        matchesAiFilter = artwork.verified;
        break;
      case "ai-flagged":
        matchesAiFilter = artwork.aiDetected;
        break;
      case "human-only":
        matchesAiFilter = !artwork.aiDetected;
        break;
      default:
        matchesAiFilter = true;
    }
    
    return matchesSearch && matchesCategory && matchesArtistType && matchesMedium && matchesPrice && matchesAiFilter;
  });

  // Sort the filtered artwork
  const sortedArtwork = [...filteredArtwork].sort((a, b) => {
    if (sortBy === "latest") {
      return b.year - a.year;
    } else if (sortBy === "mostLiked") {
      return b.likes - a.likes;
    } else if (sortBy === "mostViewed") {
      return b.views - a.views;
    } else if (sortBy === "priceLowHigh") {
      return a.price - b.price;
    } else if (sortBy === "priceHighLow") {
      return b.price - a.price;
    } else if (sortBy === "aiConfidence") {
      return b.aiConfidence - a.aiConfidence;
    }
    return 0;
  });

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedArtistType("All");
    setSelectedMedium("All");
    setPriceRange([0, 1000]);
    setAiFilter("all");
    setSortBy("latest");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="text-center mb-8 mx-0 my-[35px]">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-artswarit-purple to-blue-500">
              Explore Artwork
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover stunning artwork from talented artists across various styles and mediums.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-6">
            <Input 
              type="text" 
              placeholder="Search artworks by title or artist..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 pr-4 py-2 text-sm backdrop-blur-sm bg-white/80 border-blue-100 focus:border-artswarit-purple" 
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
          </div>

          {/* Quick AI Filter Buttons */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            <Button 
              variant={aiFilter === "all" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setAiFilter("all")}
              className={aiFilter === "all" ? "bg-gradient-to-r from-artswarit-purple to-blue-500 border-none" : ""}
            >
              All Artwork
            </Button>
            <Button 
              variant={aiFilter === "verified-only" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setAiFilter("verified-only")}
              className={`flex items-center gap-1 ${aiFilter === "verified-only" ? "bg-green-500 hover:bg-green-600 border-none" : ""}`}
            >
              <Shield className="w-3 h-3" />
              Verified Only
            </Button>
            <Button 
              variant={aiFilter === "human-only" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setAiFilter("human-only")}
              className={aiFilter === "human-only" ? "bg-blue-500 hover:bg-blue-600 border-none" : ""}
            >
              Human Created
            </Button>
            <Button 
              variant={aiFilter === "ai-flagged" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setAiFilter("ai-flagged")}
              className={`flex items-center gap-1 ${aiFilter === "ai-flagged" ? "bg-red-500 hover:bg-red-600 border-none" : ""}`}
            >
              <AlertTriangle className="w-3 h-3" />
              AI Flagged
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-lg shadow-sm border border-blue-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-primary" />
                <h3 className="font-semibold text-lg">Filters</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  {showAdvancedFilters ? "Hide" : "Show"} Advanced
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category filter */}
              <div>
                <Label className="block mb-2 font-medium">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Artist Type filter */}
              <div>
                <Label className="block mb-2 font-medium">Artist Type</Label>
                <Select value={selectedArtistType} onValueChange={setSelectedArtistType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select artist type" />
                  </SelectTrigger>
                  <SelectContent>
                    {artistTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Medium filter */}
              <div>
                <Label className="block mb-2 font-medium">Medium</Label>
                <Select value={selectedMedium} onValueChange={setSelectedMedium}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medium" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediums.map(medium => (
                      <SelectItem key={medium} value={medium}>{medium}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Label className="block mb-2 font-medium">Sort by</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="mostLiked">Most Liked</SelectItem>
                    <SelectItem value="mostViewed">Most Viewed</SelectItem>
                    <SelectItem value="priceLowHigh">Price: Low to High</SelectItem>
                    <SelectItem value="priceHighLow">Price: High to Low</SelectItem>
                    <SelectItem value="aiConfidence">AI Detection Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showAdvancedFilters && (
              <>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price range filter */}
                  <div>
                    <Label htmlFor="price-range" className="block mb-2 font-medium">
                      Price range: ${priceRange[0]} - ${priceRange[1]}
                    </Label>
                    <Slider 
                      id="price-range" 
                      defaultValue={[0, 1000]} 
                      max={1000} 
                      step={50} 
                      value={priceRange} 
                      onValueChange={setPriceRange} 
                      className="my-4" 
                    />
                  </div>

                  {/* View Mode */}
                  <div>
                    <Label className="block mb-2 font-medium">View Mode</Label>
                    <RadioGroup value={viewMode} onValueChange={setViewMode} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="carousel" id="carousel" />
                        <Label htmlFor="carousel">Carousel</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grid" id="grid" />
                        <Label htmlFor="grid">Grid</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredArtwork.length} of {allArtwork.length} artworks
              {aiFilter !== "all" && <span className="ml-2 text-sm">• {aiFilter.replace("-", " ")}</span>}
            </p>
            <Separator className="mt-2" />
          </div>

          {/* Artwork display */}
          {filteredArtwork.length > 0 ? (
            <div className="mt-8">
              {viewMode === "carousel" ? (
                <Carousel
                  opts={{
                    align: "start",
                    loop: true
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {sortedArtwork.map(artwork => (
                      <CarouselItem key={artwork.id} className="md:basis-2/3 lg:basis-1/2 pl-4">
                        <div className="artwork-card group h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-lg transition-all duration-500 neo-blur-sm relative">
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          
                          {/* AI Detection Badge */}
                          <div className="absolute top-4 right-4 z-10">
                            {artwork.aiDetected ? (
                              <div className="bg-red-500/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                AI Detected ({Math.round(artwork.aiConfidence * 100)}%)
                              </div>
                            ) : artwork.verified ? (
                              <div className="bg-green-500/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Verified
                              </div>
                            ) : (
                              <div className="bg-blue-500/90 text-white px-2 py-1 rounded-full text-xs">
                                Human Created
                              </div>
                            )}
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col space-y-2">
                              <h3 className="text-white text-3xl font-semibold">{artwork.title}</h3>
                              <p className="text-gray-200 text-xl">by {artwork.artist}</p>
                              <p className="text-gray-300">{artwork.category} • {artwork.medium} • {artwork.year}</p>
                              <p className="text-white text-xl font-semibold mt-1">${artwork.price}</p>
                              
                              {/* Stats display */}
                              <div className="flex items-center space-x-6 mt-2 text-gray-200 text-lg">
                                <div className="flex items-center gap-2">
                                  <Heart size={20} className="text-red-400" />
                                  <span>{artwork.likes}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Eye size={20} className="text-blue-400" />
                                  <span>{artwork.views}</span>
                                </div>
                              </div>
                              
                              <Button className="mt-4 bg-gradient-to-r from-artswarit-purple to-blue-500 border-none w-full md:w-auto">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2 bg-white/80 backdrop-blur-md border border-white/30 text-primary hover:bg-white/90" />
                  <CarouselNext className="right-2 bg-white/80 backdrop-blur-md border border-white/30 text-primary hover:bg-white/90" />
                </Carousel>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedArtwork.map(artwork => (
                    <div key={artwork.id} className="artwork-card group h-[400px] rounded-xl overflow-hidden shadow-lg transition-all duration-500 neo-blur-sm relative">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* AI Detection Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        {artwork.aiDetected ? (
                          <div className="bg-red-500/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            AI
                          </div>
                        ) : artwork.verified ? (
                          <div className="bg-green-500/90 text-white px-2 py-1 rounded-full text-xs">
                            ✓
                          </div>
                        ) : null}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white text-lg font-semibold mb-1">{artwork.title}</h3>
                          <p className="text-gray-200 text-sm">by {artwork.artist}</p>
                          <p className="text-white text-lg font-semibold mt-2">${artwork.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-lg">
              <h3 className="font-heading text-xl font-semibold mb-2">No artwork found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters to find more artwork.
              </p>
              <Button onClick={clearAllFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Explore;
