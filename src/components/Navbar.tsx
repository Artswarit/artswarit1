
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, User, Home, TrendingUp, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  
  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Improved smooth scroll function with offset for any section
  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    
    // Only try to scroll if we're on the home page
    if (location.pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        // Set timeout to ensure DOM is ready
        setTimeout(() => {
          // Add offset for fixed header (80px)
          const yOffset = -80; 
          const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
          
          // Close mobile menu after navigation
          setIsOpen(false);
        }, 100);
      }
    } else {
      // If we're not on the home page, navigate to home with hash
      setIsOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserDashboard = () => {
    // Get user profile to determine role - for now default to client
    return "/client-dashboard";
  };

  return (
    <header className={`fixed top-0 left-0 right-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center cursor-pointer" 
              onClick={() => setIsOpen(false)}
            >
              <span className="font-heading font-bold text-2xl text-gradient-purple">Artswarit</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  location.pathname === '/' 
                    ? 'text-primary border-primary' 
                    : 'text-gray-600 hover:text-primary border-transparent hover:border-primary'
                }`}
              >
                <Home className="mr-1 h-4 w-4" />
                Home
              </Link>
              
              {location.pathname === '/' ? (
                <a 
                  href="#featured-artists" 
                  onClick={(e) => scrollToSection(e, 'featured-artists')}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors duration-200"
                >
                  <User className="mr-1 h-4 w-4" />
                  Artists
                </a>
              ) : (
                <Link 
                  to="/#featured-artists"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors duration-200"
                >
                  <User className="mr-1 h-4 w-4" />
                  Artists
                </Link>
              )}
              
              {location.pathname === '/' ? (
                <a 
                  href="#artwork" 
                  onClick={(e) => scrollToSection(e, 'artwork')}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors duration-200"
                >
                  <Sparkles className="mr-1 h-4 w-4" />
                  Artwork
                </a>
              ) : (
                <Link 
                  to="/#artwork"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors duration-200"
                >
                  <Sparkles className="mr-1 h-4 w-4" />
                  Artwork
                </Link>
              )}
              
              <Link 
                to="/explore" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  location.pathname === '/explore' 
                    ? 'text-primary border-primary' 
                    : 'text-gray-600 hover:text-primary border-transparent hover:border-primary'
                }`}
              >
                <TrendingUp className="mr-1 h-4 w-4" />
                Trending
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search artists..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-transparent bg-white/80"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </div>
            </div>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                    <User className="mr-2 h-4 w-4" />
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(getUserDashboard())}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} disabled={loading}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-primary focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu - Now with fixed position when open */}
      {isOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-lg fixed w-full left-0 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="pt-2 pb-4 space-y-1">
            <Link
              to="/"
              className={`flex items-center pl-3 pr-4 py-2 text-base font-medium ${
                location.pathname === '/' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
            
            {location.pathname === '/' ? (
              <a
                href="#featured-artists"
                onClick={(e) => scrollToSection(e, 'featured-artists')}
                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:bg-primary/10 hover:text-primary"
              >
                <User className="mr-2 h-4 w-4" />
                Artists
              </a>
            ) : (
              <Link
                to="/#featured-artists"
                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:bg-primary/10 hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                <User className="mr-2 h-4 w-4" />
                Artists
              </Link>
            )}
            
            {location.pathname === '/' ? (
              <a
                href="#artwork"
                onClick={(e) => scrollToSection(e, 'artwork')}
                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:bg-primary/10 hover:text-primary"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Artwork
              </a>
            ) : (
              <Link
                to="/#artwork"
                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:bg-primary/10 hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Artwork
              </Link>
            )}
            
            <Link
              to="/explore"
              className={`flex items-center pl-3 pr-4 py-2 text-base font-medium ${
                location.pathname === '/explore' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <User className="h-10 w-10 rounded-full text-gray-400" />
              </div>
              <div className="ml-3 space-y-2">
                {user ? (
                  <>
                    <div className="text-base font-medium text-gray-600">{user.email}</div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate(getUserDashboard());
                      }}
                      className="block text-base font-medium text-gray-600 hover:text-primary"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                      className="block text-base font-medium text-primary"
                      disabled={loading}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block text-base font-medium text-gray-600 hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="block text-base font-medium text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
