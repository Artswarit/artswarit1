import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Rest } from "@/integrations/supabase/restClient";

// Minimal artwork type
interface Artwork {
  id: string;
  title: string;
  image_url: string;
}

const ArtistDashboardRest: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Basic SEO
    document.title = "Artist Dashboard | Artworks";
    const desc = "Browse latest artworks sorted by date for the Artist Dashboard.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    // Canonical
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    const canonicalHref = `${window.location.origin}/artist-dashboard-rest`;
    if (existingCanonical) {
      existingCanonical.setAttribute("href", canonicalHref);
    } else {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      link.setAttribute("href", canonicalHref);
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    async function fetchArtworks() {
      try {
        setLoading(true);
        setError(null);
        const data = await Rest.select<Artwork[]>(
          "artworks",
          "*",
          { order: { column: "created_at", ascending: false } }
        );
        setArtworks(data || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load artworks");
      } finally {
        setLoading(false);
      }
    }
    fetchArtworks();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <Navbar />
      </header>
      <main className="flex-1 container mx-auto px-4 md:px-6 py-24">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">Artist Dashboard</h1>
        <section aria-labelledby="artworks-list">
          <h2 id="artworks-list" className="sr-only">Artworks</h2>
          {loading && (
            <p className="text-muted-foreground">Loading artworks...</p>
          )}
          {error && (
            <p className="text-destructive">{error}</p>
          )}
          {!loading && !error && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((art) => (
                <li key={art.id} className="rounded-lg overflow-hidden border">
                  <article>
                    <img
                      src={art.image_url}
                      alt={`Artwork: ${art.title}`}
                      loading="lazy"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-base font-medium line-clamp-1">{art.title}</h3>
                    </div>
                  </article>
                </li>
              ))}
              {artworks.length === 0 && (
                <li>
                  <p className="text-muted-foreground">No artworks found.</p>
                </li>
              )}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistDashboardRest;
