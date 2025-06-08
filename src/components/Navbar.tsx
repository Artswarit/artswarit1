
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ModeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 fixed w-full top-0 z-50">
      <div className="container max-w-screen-xl mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
        
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            onClick={scrollToTop}
          >
            <span className="font-bold text-xl text-artswarit-purple">Artswarit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-artswarit-purple transition-colors">
              Home
            </Link>
            <Link to="/explore" className="text-gray-700 hover:text-artswarit-purple transition-colors">
              Explore Artworks
            </Link>
            <Link to="/explore-artists" className="text-gray-700 hover:text-artswarit-purple transition-colors">
              Explore Artists
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-artswarit-purple transition-colors">
              Categories
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                      <AvatarFallback>{user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link to={user.user_metadata?.role === 'artist' ? "/artist-dashboard" : "/client-dashboard"}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-artswarit-purple transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-artswarit-purple text-white rounded-md px-4 py-2 hover:bg-artswarit-purple-dark transition-colors">
                  Sign Up
                </Link>
              </>
            )}
            <ModeToggle />
          </div>

          {/* Mobile menu button */}
          {isMobile && (
            <Button variant="ghost" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-artswarit-purple hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                to="/explore"
                className="block px-3 py-2 text-gray-700 hover:text-artswarit-purple hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMenu}
              >
                Explore Artworks
              </Link>
              <Link
                to="/explore-artists"
                className="block px-3 py-2 text-gray-700 hover:text-artswarit-purple hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMenu}
              >
                Explore Artists
              </Link>
              <Link
                to="/categories"
                className="block px-3 py-2 text-gray-700 hover:text-artswarit-purple hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMenu}
              >
                Categories
              </Link>
              
              {user ? (
                <>
                  <Link
                    to={user.user_metadata?.role === 'artist' ? "/artist-dashboard" : "/client-dashboard"}
                    className="block px-3 py-2 text-gray-700 hover:text-artswarit-purple hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { signOut(); closeMenu(); }}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-artswarit-purple hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 bg-artswarit-purple text-white rounded-md hover:bg-artswarit-purple-dark transition-colors"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <ModeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
