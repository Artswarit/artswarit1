
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, User, Home, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
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
  const { profile } = useProfile();
  
  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserDashboard = () => {
    if (profile?.role === 'artist') {
      return "/artist-dashboard";
    }
    return "/client-dashboard";
  };

  const closeMobileMenu = () => setIsOpen(false);

  return (
    <header className={`fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={scrollToTop}
              className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
            >
              <span className="font-heading font-bold text-2xl bg-gradient-to-r from-artswarit-purple to-blue-500 bg-clip-text text-transparent">Artswarit</span>
            </button>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
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
              
              <Link 
                to="/explore" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  location.pathname === '/explore' 
                    ? 'text-primary border-primary' 
                    : 'text-gray-600 hover:text-primary border-transparent hover:border-primary'
                }`}
              >
                <TrendingUp className="mr-1 h-4 w-4" />
                Explore
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search artists..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-transparent bg-white/80 w-64"
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
                    <span className="max-w-32 truncate">{profile?.full_name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
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
          
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu with improved styling and functionality */}
      {isOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-xl">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Search bar for mobile */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search artists..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-transparent bg-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Navigation Links */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                location.pathname === '/' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
              }`}
            >
              <Home className="mr-3 h-5 w-5" />
              Home
            </Link>
            
            <Link
              to="/explore"
              onClick={closeMobileMenu}
              className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                location.pathname === '/explore' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
              }`}
            >
              <TrendingUp className="mr-3 h-5 w-5" />
              Explore
            </Link>

            {/* User Section */}
            <div className="pt-4 border-t border-gray-200">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center px-3 py-2">
                    <User className="h-8 w-8 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {profile?.full_name || user.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {profile?.role || 'User'}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      navigate(getUserDashboard());
                    }}
                    className="w-full flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                  
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleSignOut();
                    }}
                    className="w-full flex items-center px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block w-full px-3 py-3 text-center text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="block w-full px-3 py-3 text-center text-base font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
