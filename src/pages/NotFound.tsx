import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md w-full space-y-8">
        {/* Animated 404 */}
        <div className="relative inline-block">
          <div className="text-[8rem] sm:text-[10rem] font-black leading-none tracking-tighter bg-gradient-to-br from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="absolute inset-0 text-[8rem] sm:text-[10rem] font-black leading-none tracking-tighter bg-gradient-to-br from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent blur-2xl opacity-30 select-none">
            404
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Page Not Found</h1>
          <p className="text-muted-foreground leading-relaxed">
            The page at{" "}
            <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono text-primary break-all">
              {location.pathname}
            </code>{" "}
            doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2 rounded-xl h-12 px-6 font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button asChild className="gap-2 rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 rounded-xl h-12 px-6 font-bold">
            <Link to="/explore">
              <Search className="h-4 w-4" />
              Explore Art
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
