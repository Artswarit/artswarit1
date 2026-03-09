import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Eye, Heart, Maximize2, Bookmark,
  Crown, Lock, ExternalLink, Music, Share2,
} from "lucide-react";
import ArtworkFeedback from "@/components/artwork/ArtworkFeedback";
import SocialShareButtons from "@/components/artwork/SocialShareButtons";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import LikeParticles from "@/components/ui/LikeParticles";
import {
  Dialog, DialogContent, DialogTrigger,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function ArtworkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [artwork, setArtwork] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const { format } = useCurrencyFormat();

  useEffect(() => {
    async function init() {
      if (!id) return;

      // Fire view tracking
      const viewData: { artwork_id: string; user_id?: string } = { artwork_id: id };
      if (user?.id) viewData.user_id = user.id;
      supabase.from("artwork_views").insert(viewData).then(() => {});

      setLoading(true);
      const [artworkRes, viewsRes, likesRes] = await Promise.all([
        supabase.from("artworks").select("*").eq("id", id).maybeSingle(),
        supabase.from("artwork_views").select("id").eq("artwork_id", id),
        supabase.from("artwork_likes").select("id").eq("artwork_id", id),
      ]);

      setViewCount(viewsRes.data?.length || 0);
      setLikeCount(likesRes.data?.length || 0);

      if (artworkRes.error || !artworkRes.data) {
        setArtwork(null);
        setLoading(false);
        return;
      }

      const data = artworkRes.data;
      const meta = (data.metadata as any) || {};
      const accessType = meta.access_type || "free";

      // Gate premium / exclusive
      if (accessType === "premium" || accessType === "exclusive") {
        if (!user?.id) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        const isOwner = data.artist_id === user.id;
        if (!isOwner) {
          const { data: purchase } = await supabase
            .from("transactions")
            .select("id")
            .eq("artwork_id", id)
            .eq("buyer_id", user.id)
            .eq("status", "success")
            .maybeSingle();
          if (!purchase) {
            setAccessDenied(true);
            setLoading(false);
            return;
          }
        }
      }

      const { data: artist } = await supabase
        .from("public_profiles")
        .select("full_name, avatar_url")
        .eq("id", data.artist_id)
        .maybeSingle();

      if (user?.id) {
        const [likeRes, bookRes] = await Promise.all([
          supabase.from("artwork_likes").select("id").eq("artwork_id", id).eq("user_id", user.id).maybeSingle(),
          supabase.from("saved_artworks").select("id").eq("artwork_id", id).eq("user_id", user.id).maybeSingle(),
        ]);
        setIsLiked(!!likeRes.data);
        setIsBookmarked(!!bookRes.data);
      }

      setArtwork({
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.media_type,
        imageUrl: data.media_url,
        audioUrl: data.media_type === "audio" ? data.media_url : null,
        videoUrl: data.media_type === "video" ? data.media_url : null,
        price: data.price || 0,
        currency: meta.currency || "USD",
        accessType,
        artistId: data.artist_id,
        artist: artist?.full_name || "Unknown Artist",
        artistAvatar: artist?.avatar_url || null,
        tags: data.tags || [],
      });
      setLoading(false);

      // Real-time
      const likesChannel = supabase
        .channel(`details-likes-${id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "artwork_likes", filter: `artwork_id=eq.${id}` },
          async (payload) => {
            const n = payload.new as any;
            const o = payload.old as any;
            if ((n?.user_id || o?.user_id) === user?.id) return;
            const { data: l } = await supabase.from("artwork_likes").select("id").eq("artwork_id", id);
            setLikeCount(l?.length || 0);
          })
        .subscribe();

      const viewsChannel = supabase
        .channel(`details-views-${id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "artwork_views", filter: `artwork_id=eq.${id}` },
          () => setViewCount((p) => p + 1))
        .subscribe();

      return () => {
        supabase.removeChannel(likesChannel);
        supabase.removeChannel(viewsChannel);
      };
    }
    const cleanup = init();
    return () => { cleanup.then((fn) => fn?.()).catch(() => {}); };
  }, [id, user?.id]);

  const handleLike = async () => {
    if (!user?.id) {
      toast({ title: "Sign in required", description: "Please sign in to like artworks." });
      return;
    }
    if (isLiking || !id) return;
    setIsLiking(true);
    const prev = isLiked;
    const prevCount = likeCount;
    setIsLiked(!prev);
    setLikeCount((c) => (prev ? c - 1 : c + 1));
    if (!prev) { setAnimateLike(true); setTimeout(() => setAnimateLike(false), 700); }
    try {
      if (prev) {
        await supabase.from("artwork_likes").delete().eq("artwork_id", id).eq("user_id", user.id);
      } else {
        await supabase.from("artwork_likes").insert({ artwork_id: id, user_id: user.id });
      }
    } catch {
      setIsLiked(prev);
      setLikeCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!user?.id) {
      toast({ title: "Sign in required", description: "Please sign in to save artworks." });
      return;
    }
    if (!id) return;
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    try {
      if (prev) {
        await supabase.from("saved_artworks").delete().eq("artwork_id", id).eq("user_id", user.id);
        toast({ title: "Removed from saved" });
      } else {
        await supabase.from("saved_artworks").insert({ artwork_id: id, user_id: user.id });
        toast({ title: "Saved to your collection!" });
      }
    } catch {
      setIsBookmarked(prev);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-20">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-5 animate-pulse">
            <div className="h-7 bg-muted rounded-xl w-1/3" />
            <div className="w-full aspect-[4/3] bg-muted rounded-3xl" />
            <div className="h-14 bg-muted rounded-2xl" />
            <div className="h-20 bg-muted rounded-2xl" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Access Denied ─────────────────────────────────────────────────────────
  if (accessDenied) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="max-w-sm w-full text-center space-y-6 p-8 rounded-[2.5rem] border border-amber-400/20 bg-amber-50/50 dark:bg-amber-950/20 shadow-xl">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight mb-2">Premium Content</h1>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Purchase this artwork to unlock full access.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {!user?.id ? (
                <Button asChild className="h-12 rounded-xl font-black">
                  <Link to="/auth">Sign in to Purchase</Link>
                </Button>
              ) : (
                <Button className="h-12 rounded-xl font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none shadow-lg hover:shadow-xl transition-all">
                  <Lock className="h-4 w-4 mr-2" /> Unlock Artwork
                </Button>
              )}
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Not Found ─────────────────────────────────────────────────────────────
  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-black">Artwork Not Found</h1>
            <p className="text-muted-foreground">This artwork doesn't exist or has been removed.</p>
            <Button asChild variant="outline" className="rounded-xl font-bold h-11">
              <Link to="/explore">Back to Explore</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const accessLabel =
    artwork.accessType === "premium" ? "Premium" :
    artwork.accessType === "exclusive" ? "Exclusive" : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Sticky top nav ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/30 h-14 flex items-center px-4">
        <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              title={isBookmarked ? "Remove from saved" : "Save artwork"}
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90",
                isBookmarked
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 pb-16">
        <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">

          {/* ── IMAGE / VIDEO / AUDIO ──────────────────────────────────── */}
          <div className="group relative rounded-2xl overflow-hidden bg-muted/20 border border-border/30">
            {/* IMAGE */}
            {artwork.type === "image" && artwork.imageUrl && (
              <>
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-auto object-contain"
                  style={{ display: "block" }}
                />
                {/* Fullscreen trigger */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="absolute top-3 right-3 h-9 w-9 rounded-xl bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-110"
                      title="View fullscreen"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 border-none bg-background rounded-2xl overflow-hidden flex items-center justify-center">
                    <DialogTitle className="sr-only">Fullscreen — {artwork.title}</DialogTitle>
                    <DialogDescription className="sr-only">Full size view of {artwork.title}</DialogDescription>
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="max-w-full max-h-[96vh] object-contain rounded-2xl"
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* VIDEO */}
            {artwork.type === "video" && artwork.videoUrl && (
              <video controls playsInline className="w-full h-auto block">
                <source src={artwork.videoUrl} type="video/mp4" />
                Your browser does not support video.
              </video>
            )}

            {/* AUDIO */}
            {(artwork.type === "audio" || artwork.type === "music") && (
              <div className="p-6 space-y-4">
                {artwork.imageUrl ? (
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full rounded-xl object-cover max-h-72"
                  />
                ) : (
                  <div className="w-full h-40 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    <Music className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                {artwork.audioUrl && (
                  <audio controls className="w-full rounded-lg">
                    <source src={artwork.audioUrl} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            )}
          </div>

          {/* ── STATS BAR: like · views · share ───────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Like */}
            <div className="relative">
              <button
                onClick={handleLike}
                disabled={isLiking}
                aria-label={isLiked ? "Unlike" : "Like"}
                className={cn(
                  "flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95",
                  isLiked
                    ? "bg-red-100 dark:bg-red-500/15 text-red-500 border border-red-200 dark:border-red-500/20"
                    : "bg-muted/60 text-muted-foreground border border-transparent hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-400 hover:border-red-200/50"
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    isLiked && "fill-current scale-110",
                    animateLike && "animate-bounce"
                  )}
                />
                <span>{likeCount}</span>
              </button>
              <LikeParticles trigger={animateLike} />
            </div>

            {/* Views */}
            <div className="flex items-center gap-2 px-4 h-10 rounded-xl bg-muted/60 text-muted-foreground text-sm font-bold border border-transparent">
              <Eye className="h-4 w-4" />
              <span>{viewCount}</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Share */}
            <SocialShareButtons url={window.location.href} title={artwork.title} imageUrl={artwork.imageUrl} />
          </div>

          {/* ── TITLE + BADGES + PRICE ────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center flex-wrap gap-2">
              {artwork.category && (
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary rounded-lg">
                  {artwork.category}
                </Badge>
              )}
              {accessLabel && (
                <Badge
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest border-none rounded-lg",
                    artwork.accessType === "exclusive"
                      ? "bg-fuchsia-600/90 text-white"
                      : "bg-purple-600/90 text-white"
                  )}
                >
                  <Crown className="h-2.5 w-2.5 mr-1" />
                  {accessLabel}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {artwork.title}
            </h1>

            {artwork.price > 0 && (
              <div className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-black text-lg">
                {format(artwork.price, artwork.currency)}
              </div>
            )}
          </div>

          {/* ── ARTIST CARD ───────────────────────────────────────────── */}
          <Link
            to={`/artist/${artwork.artistId}`}
            className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-primary/20 transition-all duration-300 group"
          >
            {artwork.artistAvatar ? (
              <img
                src={artwork.artistAvatar}
                alt={artwork.artist}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-background shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shrink-0">
                {artwork.artist?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-0.5">
                Artist
              </p>
              <p className="font-black text-foreground truncate group-hover:text-primary transition-colors duration-200">
                {artwork.artist}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors duration-200 shrink-0" />
          </Link>

          {/* ── DESCRIPTION ───────────────────────────────────────────── */}
          {artwork.description && (
            <div className="p-4 sm:p-5 rounded-2xl border border-border/30 bg-muted/10">
              <p className="text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                {artwork.description}
              </p>
            </div>
          )}

          {/* ── TAGS ──────────────────────────────────────────────────── */}
          {artwork.tags?.length > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              {artwork.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ── PURCHASE CTA (premium / exclusive) ────────────────────── */}
          {(artwork.accessType === "premium" || artwork.accessType === "exclusive") && artwork.price > 0 && (
            <Button className="w-full h-13 rounded-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-500 hover:via-orange-600 hover:to-red-600 text-white border-none shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
              <Crown className="h-4 w-4 mr-2" />
              Purchase for {format(artwork.price, artwork.currency)}
            </Button>
          )}

          {/* ── SEPARATOR ─────────────────────────────────────────────── */}
          <div className="border-t border-border/30" />

          {/* ── COMMENTS & REVIEWS ────────────────────────────────────── */}
          {id && <ArtworkFeedback artworkId={id} />}

          {/* ── BACK BUTTON ───────────────────────────────────────────── */}
          <div className="flex justify-center pt-4 pb-8">
            <Button
              asChild
              variant="outline"
              className="h-11 px-8 rounded-xl font-black border-border/40 hover:bg-muted/50 transition-all"
            >
              <Link to="/explore">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Explore
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
