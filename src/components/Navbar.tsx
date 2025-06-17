
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Users, Search as SearchIcon, Video, TrendingUp, Menu, X } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const menuItems = [{
  name: "Home",
  path: "/",
  icon: <Home size={18} />
}, {
  name: "Artist",
  path: "/explore-artists",
  icon: <Users size={18} />
}, {
  name: "Explore",
  path: "/explore",
  icon: <SearchIcon size={18} />
}, {
  name: "Live",
  path: "/live-streaming",
  icon: <Video size={18} />
}, {
  name: "Trending",
  path: "/trending",
  icon: <TrendingUp size={18} />
}];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Enhanced responsive link styles
  const linkBaseClass = "relative flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-lg transition-all duration-300 before:absolute before:inset-x-2 before:bottom-0 before:h-0.5 before:bg-purple-600 before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:duration-300";
  const linkActiveClass = "text-purple-600 before:scale-x-100 bg-purple-50";
  const linkInactiveClass = "text-gray-700 hover:text-purple-600 hover:bg-gray-50";

  const handleLogoClick = (e: React.MouseEvent) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (location.pathname === "/") {
      e.preventDefault();
    }
    closeMenu();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 fixed w-full top-0 z-50 transition-all">
      <div className="w-full flex items-center h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
        {/* Logo - responsive sizing */}
        <Link 
          to="/" 
          onClick={handleLogoClick} 
          className="flex items-center font-bold text-lg text-purple-600 tracking-tight hover:opacity-80 transition-opacity"
        >
          <img 
            src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png" 
            alt="Artswarit Logo" 
            className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain transition-transform duration-300 hover:scale-110" 
          />
        </Link>

        {/* Desktop Navigation - hidden on mobile */}
        <div className="hidden lg:flex items-center ml-6 space-x-1">
          {menuItems.map(item => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`${linkBaseClass} ${location.pathname === item.path ? linkActiveClass : linkInactiveClass}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Right side controls - responsive spacing */}
        <div className="flex items-center ml-auto gap-2 sm:gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 z-50 bg-white border border-gray-200 shadow-lg" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link 
                    to={isAdmin ? "/admin-dashboard" : user.user_metadata?.role === "artist" ? "/artist-dashboard" : "/client-dashboard"}
                    className="cursor-pointer"
                  >
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-purple-600 font-medium px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-purple-600 text-white rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 font-medium text-sm hover:bg-purple-700 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button - only visible on mobile/tablet */}
          <div className="lg:hidden">
            <Button 
              variant="ghost" 
              onClick={toggleMenu} 
              className="h-8 w-8 sm:h-10 sm:w-10 p-0"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - enhanced design */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl">
          <div className="px-4 py-4 space-y-2">
            {menuItems.map(item => (
              <Link 
                to={item.path} 
                key={item.name} 
                className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all ${
                  location.pathname === item.path 
                    ? "text-purple-600 bg-purple-50 border border-purple-200" 
                    : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                }`}
                onClick={closeMenu}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            
            {user && (
              <div className="pt-3 mt-3 border-t border-gray-200">
                <Link 
                  to={isAdmin ? "/admin-dashboard" : user.user_metadata?.role === "artist" ? "/artist-dashboard" : "/client-dashboard"}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                  onClick={closeMenu}
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>Dashboard</span>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 px-4 py-3 font-medium mt-1 text-red-600 hover:text-red-700 hover:bg-red-50" 
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
