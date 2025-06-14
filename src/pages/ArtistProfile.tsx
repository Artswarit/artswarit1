import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { Verified, MapPin, Users, Heart } from "lucide-react";
import ArtistHeader from "@/components/artist-profile/ArtistHeader";
import ArtistTabs from "@/components/artist-profile/ArtistTabs";
import TagDisplay from "@/components/artist-profile/TagDisplay";
import PinnedArtworksBar from "@/components/artist-profile/PinnedArtworksBar";
import { useState } from "react";

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
  const [isFollowing, setIsFollowing] = useState(false);

  // New handlers for demo
  const handleMessage = () => alert("Message feature coming soon!");
  const handleSave = () => alert("Artist saved!");
  const handleRequestProject = () =>
    alert("Project request feature coming soon!");

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

  // Derive premium and pinned artworks from mock for demo
  const portfolio = artist.artworks.map((a, ix) => ({
    ...a,
    likes: 100 + ix * 11,
    views: 500 + ix * 30,
    price: ix === 0 ? 0 : 499 + 100 * ix,
    isPremium: ix === 1,
    isExclusive: ix === 2,
  }));

  const premiumArt = portfolio.filter((p) => p.isPremium);
  const exclusiveArt = portfolio.filter((p) => p.isExclusive);
  const pinnedArt = portfolio.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-gray-100 flex flex-col">
      <Navbar />
      <div className="pt-16 w-full">
        {/* Updated: pass enriched actions to ArtistHeader */}
        <ArtistHeader
          artist={{
            ...artist,
            premium: true,
            tags: [artist.category, ...(artist.specialties || [])],
            views: portfolio.reduce((acc, a) => acc + (a.views || 0), 0),
            tagline: artist.bio ?? "",
          }}
          isFollowing={isFollowing}
          onFollow={() => setIsFollowing((f) => !f)}
          onMessage={handleMessage}
          onSave={handleSave}
          onRequest={handleRequestProject}
        />
      </div>

      <main className="container max-w-screen-xl mx-auto flex-1 px-2 sm:px-6 pb-8 mt-6">
        {/* Tags/Category */}
        <TagDisplay tags={[artist.category, ...(artist.specialties || [])]} />
        {/* Premium Features: Pinned Artworks */}
        <PinnedArtworksBar artworks={pinnedArt} />
        {/* Portfolio Tabs */}
        <GlassCard className="p-7 md:p-8 mt-4 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-heading text-lg md:text-xl font-bold text-gray-900">
              Portfolio
            </h2>
          </div>
          <ArtistTabs
            allArt={portfolio}
            premiumArt={premiumArt}
            exclusiveArt={exclusiveArt}
            // ...other props
          />
        </GlassCard>
      </main>
      <Footer />
    </div>
  );
}
