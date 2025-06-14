
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";

// OLD MOCK DATA - simple and easy to modify/extend.
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
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      <main className="flex-1">
        {/* Cover Banner */}
        <div className="relative h-52 md:h-72 bg-gray-200">
          <img
            src={artist.cover}
            alt={`${artist.name} cover`}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 md:-translate-x-0 md:left-20">
            <img
              src={artist.avatar}
              alt={artist.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover bg-white"
            />
          </div>
        </div>
        {/* Profile Info */}
        <section className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main artist info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                {artist.name}
                {artist.isVerified && (
                  <Badge className="ml-2 bg-blue-500/80 text-white border-blue-400/50 text-xs">Verified</Badge>
                )}
              </h1>
              <div className="mb-2">
                <Badge variant="secondary">{artist.category}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {artist.specialties.map(spec => (
                  <span key={spec} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">{spec}</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-5">{artist.bio}</p>
              <div className="flex gap-6 mb-5">
                <div>
                  <span className="font-bold">{artist.followers.toLocaleString()}</span>{" "}
                  <span className="text-muted-foreground text-sm">Followers</span>
                </div>
                <div>
                  <span className="font-bold">{artist.likes.toLocaleString()}</span>{" "}
                  <span className="text-muted-foreground text-sm">Likes</span>
                </div>
                <div>
                  <span className="font-bold">{artist.location}</span>
                </div>
              </div>
              <GlassButton variant="primary" className="!px-8 !py-2">Follow</GlassButton>
            </div>
            {/* Portfolio simple */}
            <div className="w-full md:max-w-xs space-y-5">
              <GlassCard className="p-5">
                <div>
                  <h3 className="font-bold mb-2 text-lg">Artworks</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {artist.artworks.map((art) => (
                      <div key={art.id} className="rounded overflow-hidden border bg-gray-100">
                        <img src={art.img} alt={art.title} className="object-cover w-full h-20" />
                        <div className="px-2 py-1 text-xs truncate">{art.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
