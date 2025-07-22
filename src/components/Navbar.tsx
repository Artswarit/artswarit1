
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Users, Search as SearchIcon, TrendingUp } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const menuItems = [{
  name: "Home",
  path: "/",
  icon: <Home size={18} />
}, {
  name: "Artists",
  path: "/explore-artists",
  icon: <Users size={18} />
}, {
  name: "Explore",
  path: "/explore",
  icon: <SearchIcon size={18} />
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

  const linkBaseClass = "relative flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-lg transition-all duration-200 hover:bg-gray-50";
  const linkActiveClass = "text-purple-600 bg-purple-50 font-semibold";
  const linkInactiveClass = "text-gray-700 hover:text-purple-600";

  const handleLogoClick = (e: React.MouseEvent) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (location.pathname === "/") {
      e.preventDefault();
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 fixed w-full top-0 z-50 transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              onClick={handleLogoClick} 
              className="flex items-center space-x-2 font-bold text-xl text-purple-600 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png" 
                alt="Artswarit Logo" 
                className="h-10 w-10 object-contain"
              />
              <span className="hidden sm:block">Artswarit</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
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
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url} 
                        alt={user.user_metadata?.full_name || user.email} 
                      />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link to={isAdmin ? "/admin-dashboard" : user.user_metadata?.role === "artist" ? "/artist-dashboard" : "/client-dashboard"}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-purple-600 font-medium px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-purple-600 text-white rounded-lg px-4 py-2 font-medium text-sm hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <Button variant="ghost" onClick={toggleMenu} className="h-10 w-10 p-0 md:hidden">
                <span className="sr-only">Toggle Menu</span>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {isOpen ? (
                    <>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </>
                  ) : (
                    <>
                      <path d="M3 12h18M3 6h18M3 18h18" />
                    </>
                  )}
                </svg>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {menuItems.map(item => (
              <Link
                to={item.path}
                key={item.name}
                className={`flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  location.pathname === item.path 
                    ? "text-purple-600 bg-purple-50" 
                    : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                }`}
                onClick={closeMenu}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link 
                  to={isAdmin ? "/admin-dashboard" : user.user_metadata?.role === "artist" ? "/artist-dashboard" : "/client-dashboard"} 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors font-medium" 
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-4 py-3 font-medium text-gray-700" 
                  onClick={() => { signOut(); closeMenu(); }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link 
                  to="/login" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors font-medium" 
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="flex items-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium mx-4" 
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
