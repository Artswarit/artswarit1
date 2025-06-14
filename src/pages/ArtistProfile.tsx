import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { Verified, MapPin, Users, Heart } from "lucide-react";

// Mock data remains the same for demonstration
const artistsData = {
  "1": {
    id: "1",
    name: "Alex Rivera",
    category: "Musician",
    avatar: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    bio: "Multi-platinum musician passionate about creating moving music and telling stories.",
    followers: 12035,
    likes: 3204,
    isVerified: true,
    specialties: ["Pop", "Rock", "Electronic"],
    location: "Los Angeles, CA",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    artworks: [
      {
        id: "a1",
        title: "Midnight Symphony",
        img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "a2",
        title: "Live Concert 2024",
        img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
      },
    ]
  },
  "2": {
    id: "2",
    name: "Maya Johnson",
    category: "Writer",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80",
    bio: "Award-winning author, creative in fantasy and science fiction novels.",
    followers: 8621,
    likes: 1945,
    isVerified: true,
    specialties: ["Fantasy", "Sci-Fi", "Short Stories"],
    location: "New York, NY",
    cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    artworks: [
      {
        id: "b1",
        title: "Crystal Realm",
        img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80",
      }
    ]
  }
};

export default function ArtistProfile() {
  const { id } = useParams();
  const artist = artistsData[id as keyof typeof artistsData];

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <GlassCard className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Artist Not Found</h1>
            <p className="text-muted-foreground mb-4">The artist you're looking for doesn't exist.</p>
            <GlassButton>
              <Link to="/explore">Browse Artists</Link>
            </GlassButton>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-purple-50 to-slate-100 flex flex-col">
      <Navbar />
      {/* Cover and Profile */}
      <div className="relative w-full h-56 md:h-72 mb-24">
        <img
          src={artist.cover}
          alt={`${artist.name} cover`}
          className="absolute w-full h-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Avatar card */}
        <div className="absolute left-1/2 -bottom-20 transform -translate-x-1/2 md:left-20 md:translate-x-0">
          <GlassCard className="p-3 flex flex-col items-center shadow-2xl glass-effect border-2 border-white/30">
            <img
              src={artist.avatar}
              alt={artist.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover shadow-lg"
            />
          </GlassCard>
        </div>
      </div>
      {/* Main Info and Portfolio */}
      <main className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Profile section */}
        <section className="w-full md:w-[320px] md:pt-12">
          <GlassCard className="p-7 md:p-8 mb-4 shadow-lg bg-white/60">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">{artist.name}</h1>
                {artist.isVerified && (
                  <Badge className="bg-blue-500 text-white flex items-center gap-1">
                    <Verified size={14} /> Verified
                  </Badge>
                )}
              </div>
              <div className="mb-2">
                <Badge variant="secondary" className="capitalize">{artist.category}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                {artist.specialties.map(spec => (
                  <span key={spec} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs">{spec}</span>
                ))}
              </div>
              {artist.location && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <MapPin size={16} className="opacity-80" />
                  <span>{artist.location}</span>
                </div>
              )}
              <p className="text-muted-foreground text-base line-clamp-4 mb-4">{artist.bio}</p>
              <div className="flex justify-center gap-6 my-4">
                <div className="flex flex-col items-center text-gray-800">
                  <Users size={18} />
                  <span className="font-bold">{artist.followers.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">Followers</span>
                </div>
                <div className="flex flex-col items-center text-gray-800">
                  <Heart size={18} />
                  <span className="font-bold">{artist.likes.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">Likes</span>
                </div>
              </div>
              <GlassButton className="w-full !py-2 mt-2">Follow</GlassButton>
            </div>
          </GlassCard>
        </section>
        {/* Portfolio section */}
        <section className="flex-1 min-w-0 md:pt-12 pb-12">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-bold text-lg md:text-xl text-gray-900">Portfolio</h2>
            <span className="text-xs text-gray-500">{artist.artworks.length} Artworks</span>
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {artist.artworks.map((art) => (
              <GlassCard
                key={art.id}
                className="overflow-hidden p-0 hover:scale-[1.03] transition-transform duration-200 shadow-md cursor-pointer group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={art.img}
                    alt={art.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3">
                    <h3 className="text-white font-semibold text-base truncate drop-shadow">{art.title}</h3>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
