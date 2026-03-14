import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft, Eye, Heart, Maximize2, Bookmark,
  Crown, Lock, Music, Send, MessageCircle, Share2, X
} from "lucide-react";
import ArtworkFeedback from "@/components/artwork/ArtworkFeedback";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import LikeParticles from "@/components/ui/LikeParticles";
import {
  Dialog, DialogContent, DialogTrigger,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LogoLoader from "@/components/ui/LogoLoader";

export default function ArtworkDetails({ isModal = false }: { isModal?: boolean }) {
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
  const [doubleTapLike, setDoubleTapLike] = useState(false);
  const lastTapRef = useRef(0);
  const { format } = useCurrencyFormat();
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    async function init() {
      if (!id) return;

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
      
      // Block access to banned content immediately
      if (meta.admin_banned) {
        setArtwork(null);
        setLoading(false);
        toast({
          title: "Content Unavailable",
          description: "This artwork has been removed for violating community guidelines.",
          variant: "destructive"
        });
        return;
      }

      const accessType = meta.access_type || "free";

      if (accessType === "premium" || accessType === "exclusive") {
        if (!user?.id) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        const isOwner = data.artist_id === user.id;
        if (!isOwner) {
          const { data: purchase } = await supabase
            .from("artwork_unlocks")
            .select("id")
            .eq("artwork_id", id)
            .eq("user_id", user.id)
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

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) {
        handleLike();
        setDoubleTapLike(true);
        setTimeout(() => setDoubleTapLike(false), 1000);
      }
    }
    lastTapRef.current = now;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: artwork?.title, url });
      } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!" });
    }
  };

  const openComments = () => setCommentsOpen(true);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn("min-h-screen flex flex-col bg-background", isModal && "min-h-0 h-[400px]")}>
        {!isModal && <Navbar />}
        <div className="flex-1 flex items-center justify-center pt-24">
          <LogoLoader text="Loading artwork…" />
        </div>
      </div>
    );
  }

  // ── Access Denied ─────────────────────────────────────────
  if (accessDenied) {
    return (
      <div className={cn("min-h-screen flex flex-col bg-background", isModal && "min-h-0")}>
        {!isModal && <Navbar />}
        <main className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="max-w-sm w-full text-center space-y-6 p-8 rounded-2xl border border-border/40 bg-card shadow-xl">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight mb-2">Premium Content</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Purchase this artwork to unlock full access.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {!user?.id ? (
                <Button asChild className="h-12 rounded-xl font-semibold">
                  <Link to="/login">Sign in to Purchase</Link>
                </Button>
              ) : (
                <Button className="h-12 rounded-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none shadow-lg">
                  <Lock className="h-4 w-4 mr-2" /> Unlock Artwork
                </Button>
              )}
              <Button variant="ghost" className="rounded-xl font-medium" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Not Found ─────────────────────────────────────────────
  if (!artwork) {
    return (
      <div className={cn("min-h-screen flex flex-col bg-background", isModal && "min-h-0")}>
        {!isModal && <Navbar />}
        <main className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Artwork Not Found</h1>
            <p className="text-muted-foreground">This artwork doesn't exist or has been removed.</p>
            <Button asChild variant="outline" className="rounded-xl h-11">
              <Link to="/explore">Back to Explore</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", isModal && "min-h-0")}>
      {!isModal && <Navbar />}

      {isModal && (
        <button 
          onClick={() => navigate(-1)}
          className="fixed top-[calc(1rem+var(--safe-top))] right-4 z-[110] h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all shadow-xl"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <main className={cn("flex-1 pb-4", isModal ? "pt-[var(--safe-top)]" : "pt-[calc(var(--navbar-height-mobile)+var(--safe-top)+1rem)] sm:pt-[calc(var(--navbar-height-desktop)+var(--safe-top)+1.5rem)]")}>
        <div className={cn("max-w-6xl mx-auto px-0", !isModal && "sm:px-4 lg:px-8")}>
          <div className={cn("bg-card overflow-hidden", !isModal ? "sm:rounded-2xl border-x-0 sm:border border-border/40 shadow-sm" : "border-none")}>

          {/* ── ARTIST HEADER (Instagram-style post header) ─────────── */}
          <div className="flex items-center gap-3 px-3 sm:px-4 py-3">
            <button onClick={() => navigate(-1)} className="mr-1 text-muted-foreground hover:text-foreground transition-colors sm:hidden">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Link
              to={`/artist/${artwork.artistId}`}
              className="flex items-center gap-3 flex-1 min-w-0 group"
            >
              {artwork.artistAvatar ? (
                <img
                  src={artwork.artistAvatar}
                  alt={artwork.artist}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {artwork.artist?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {artwork.artist}
                </p>
                {artwork.category && (
                  <p className="text-[11px] text-muted-foreground truncate">{artwork.category}</p>
                )}
              </div>
            </Link>
            {/* Access badge */}
            {artwork.accessType !== "free" && (
              <span className={cn(
                "text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1",
                artwork.accessType === "exclusive"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
              )}>
                <Crown className="h-3 w-3" />
                {artwork.accessType === "exclusive" ? "Exclusive" : "Premium"}
              </span>
            )}
          </div>

          {/* ── MEDIA (Full-width Instagram style) ─────────────────── */}
          <div
            className="relative w-full select-none"
            onClick={handleDoubleTap}
          >
            {/* IMAGE */}
            {artwork.type === "image" && artwork.imageUrl && (
              <>
                <div className="bg-muted/30 flex items-center justify-center">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-auto max-h-[90vh] object-contain block mx-auto"
                    draggable={false}
                  />
                </div>
                {/* Fullscreen */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 border-none bg-background rounded-2xl overflow-hidden flex items-center justify-center">
                    <DialogTitle className="sr-only">Fullscreen — {artwork.title}</DialogTitle>
                    <DialogDescription className="sr-only">Full size view of {artwork.title}</DialogDescription>
                    <img src={artwork.imageUrl} alt={artwork.title} className="max-w-full max-h-[96vh] object-contain" />
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* VIDEO */}
            {artwork.type === "video" && artwork.videoUrl && (
              <video controls playsInline className="w-full h-auto block max-h-[80vh]">
                <source src={artwork.videoUrl} type="video/mp4" />
              </video>
            )}

            {/* AUDIO */}
            {(artwork.type === "audio" || artwork.type === "music") && (
              <div className="p-6 space-y-4">
                {artwork.imageUrl ? (
                  <img src={artwork.imageUrl} alt={artwork.title} className="w-full rounded-xl object-cover max-h-72" />
                ) : (
                  <div className="w-full h-48 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Music className="h-14 w-14 text-primary/30" />
                  </div>
                )}
                {artwork.audioUrl && (
                  <audio controls className="w-full">
                    <source src={artwork.audioUrl} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            )}

            {/* Double-tap heart animation */}
            {doubleTapLike && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <Heart className="h-24 w-24 text-white fill-white drop-shadow-2xl animate-ping" style={{ animationDuration: '0.6s', animationIterationCount: 1 }} />
              </div>
            )}
          </div>

          {/* ── ACTION BAR (Instagram-style) ────────────────────────── */}
          <div className="flex items-center px-3 sm:px-4 py-2.5">
            {/* Left actions */}
            <div className="flex items-center gap-4">
              {/* Like */}
              <div className="relative">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  aria-label={isLiked ? "Unlike" : "Like"}
                  className="flex items-center justify-center transition-transform duration-200 active:scale-75"
                >
                  <Heart
                    className={cn(
                      "h-6 w-6 transition-all duration-300",
                      isLiked
                        ? "text-red-500 fill-red-500 scale-110"
                        : "text-foreground hover:text-muted-foreground"
                    )}
                  />
                </button>
                <LikeParticles trigger={animateLike} />
              </div>

              {/* Comment */}
              <button
                onClick={openComments}
                aria-label="Comments"
                className="flex items-center justify-center transition-transform duration-200 active:scale-90"
              >
                <MessageCircle className="h-6 w-6 text-foreground hover:text-muted-foreground transition-colors" />
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                aria-label="Share"
                className="flex items-center justify-center transition-transform duration-200 active:scale-90"
              >
                <Send className="h-5.5 w-5.5 text-foreground hover:text-muted-foreground transition-colors -rotate-12" />
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              aria-label={isBookmarked ? "Remove from saved" : "Save"}
              className="flex items-center justify-center transition-transform duration-200 active:scale-75"
            >
              <Bookmark
                className={cn(
                  "h-6 w-6 transition-all duration-300",
                  isBookmarked
                    ? "text-foreground fill-foreground"
                    : "text-foreground hover:text-muted-foreground"
                )}
              />
            </button>
          </div>

          {/* ── LIKES COUNT ─────────────────────────────────────────── */}
          <div className="px-3 sm:px-4">
            <p className="text-sm font-semibold text-foreground">
              {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
            </p>
          </div>

          {/* ── TITLE & DESCRIPTION (Instagram caption style) ──────── */}
          <div className="px-3 sm:px-4 pt-1.5 pb-1 space-y-1">
            <p className="text-sm">
              <Link to={`/artist/${artwork.artistId}`} className="font-semibold text-foreground hover:text-muted-foreground transition-colors mr-1.5">
                {artwork.artist}
              </Link>
              <span className="font-medium text-foreground">{artwork.title}</span>
            </p>
            {artwork.description && (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {artwork.description}
              </p>
            )}
          </div>

          {/* ── TAGS ────────────────────────────────────────────────── */}
          {artwork.tags?.length > 0 && (
            <div className="px-3 sm:px-4 pb-1">
              <p className="text-sm text-primary/80">
                {artwork.tags.map((tag: string) => `#${tag}`).join(' ')}
              </p>
            </div>
          )}

          {/* ── VIEWS ───────────────────────────────────────────────── */}
          <div className="px-3 sm:px-4 pb-2">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {viewCount.toLocaleString()} views
            </p>
          </div>

          {/* ── PRICE / PURCHASE CTA ────────────────────────────────── */}
          {artwork.price > 0 && (artwork.accessType === "premium" || artwork.accessType === "exclusive") && (
            <div className="px-3 sm:px-4 pb-3">
              <Button className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-500 hover:via-orange-600 hover:to-red-600 text-white border-none shadow-md">
                <Crown className="h-4 w-4 mr-2" />
                Purchase for {format(artwork.price, artwork.currency)}
              </Button>
            </div>
          )}

          </div>

          {/* ── COMMENT BOTTOM SHEET ───────────────────────────────── */}
          {id && <ArtworkFeedback artworkId={id} isOpen={commentsOpen} onClose={() => setCommentsOpen(false)} />}
      </div>
    </main>
  </div>
);
}
