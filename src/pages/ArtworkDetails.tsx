import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Image, FileAudio, FileVideo } from "lucide-react";
const mockArtworks = [{
  id: "1",
  title: "Sunrise in the Hills",
  artist: "Alex Rivera",
  artistId: "1",
  type: "image",
  imageUrl: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
}, {
  id: "2",
  title: "City Nights",
  artist: "Lisa Zhang",
  artistId: "9",
  type: "audio",
  imageUrl: "https://images.unsplash.com/photo-1494790108755-2616c4e7e01c?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
  audioUrl: "/audio/city-nights.mp3"
}, {
  id: "3",
  title: "Rising Beat",
  artist: "Jordan Smith",
  artistId: "3",
  type: "video",
  imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
  videoUrl: "/video/rising-beat.mp4"
}
// ...add more mock artworks here as desired
];
export default function ArtworkDetails() {
  const {
    id
  } = useParams();
  const artwork = mockArtworks.find(a => a.id === id);
  if (!artwork) {
    return <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <GlassCard className="p-12 text-center max-w-lg mx-auto">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-xl font-bold mb-2">Artwork Not Found</h1>
            <p className="mb-6 text-muted-foreground">Sorry, this artwork doesn&apos;t exist or has been removed.</p>
            <Button asChild variant="outline">
              <Link to="/explore">Back to Explore</Link>
            </Button>
          </GlassCard>
        </main>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 my-[56px]">
        <GlassCard className="max-w-2xl w-full mx-auto p-6 md:p-10">
          <div className="mb-4 flex items-center gap-3">
            {artwork.type === "image" && <Image className="text-blue-500" />}
            {artwork.type === "audio" && <FileAudio className="text-green-600" />}
            {artwork.type === "video" && <FileVideo className="text-red-600" />}
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">{artwork.title}</h1>
          </div>
          <div className="mb-8 rounded overflow-hidden">
            <img src={artwork.imageUrl} alt={artwork.title} className="w-full object-cover rounded-lg" />
          </div>
          {artwork.type === "audio" && artwork.audioUrl && <audio controls className="mb-4 w-full">
              <source src={artwork.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>}
          {artwork.type === "video" && artwork.videoUrl && <video controls className="mb-4 w-full rounded-lg">
              <source src={artwork.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>}
          <div className="mb-6">
            <span className="text-muted-foreground text-sm">by </span>
            <Link to={`/artist/${artwork.artistId}`} className="text-blue-700 hover:underline font-medium">
              {artwork.artist}
            </Link>
          </div>
          <Button asChild className="mt-2">
            <Link to="/explore">Back to Explore</Link>
          </Button>
        </GlassCard>
      </main>
      <Footer />
    </div>;
}