
import React, { useState } from "react";
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
import { Menu, X, Home, Users, Image, Flame, Search as SearchIcon } from "lucide-react";

const menuItems = [
  {
    name: "Home",
    path: "/",
    icon: <Home size={18} />
  },
  {
    name: "Artists",
    path: "/explore",
    icon: <Users size={18} />
  },
  {
    name: "Artwork",
    path: "/artwork",
    icon: <Image size={18} />
  },
  {
    name: "Trending",
    path: "/trending",
    icon: <Flame size={18} />
  }
];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render desktop search bar
  const renderSearchBar = (
    <div className="hidden md:flex items-center relative ml-4">
      <input
        type="text"
        placeholder="Search artists, artwork, categories..."
        className="pl-9 pr-4 py-2 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-artswarit-purple text-sm w-64 transition"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search"
      />
      <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
    </div>
  );

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 fixed w-full top-0 z-50">
      <div className="container max-w-screen-xl mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full w-full">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            onClick={scrollToTop}
          >
            <span className="font-bold text-xl text-purple-600">Artswarit</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center flex-1 justify-center gap-2">
            {menuItems.map((item) => (
              <Link
                to={item.path}
                className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium transition-all text-gray-700 hover:text-purple-600 hover:bg-purple-50 
                  ${location.pathname === item.path ? "text-purple-600 bg-purple-50" : ""}`}
                key={item.name}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Search + Auth */}
          <div className="flex items-center gap-3">
            {!isMobile && renderSearchBar}

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
                <DropdownMenuContent className="w-56 z-50 bg-white border border-gray-200" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link to={user.user_metadata?.role === "artist" ? "/artist-dashboard" : "/client-dashboard"}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-purple-600 text-white rounded-md px-4 py-2 font-medium hover:bg-purple-700 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
            <ModeToggle />
          </div>
          {/* Mobile menu button */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              {user && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                  <AvatarFallback>{user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <Button variant="ghost" onClick={toggleMenu}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white z-50 border-b border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {menuItems.map((item) => (
                <Link
                  to={item.path}
                  key={item.name}
                  className={`flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors font-medium ${
                    location.pathname === item.path ? "text-purple-600 bg-purple-50" : ""
                  }`}
                  onClick={closeMenu}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="mt-2">
                {user ? (
                  <>
                    <Link
                      to={user.user_metadata?.role === "artist" ? "/artist-dashboard" : "/client-dashboard"}
                      className="block px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                      onClick={closeMenu}
                    >
                      Dashboard
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-medium mt-1"
                      onClick={() => {
                        signOut();
                        closeMenu();
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                      onClick={closeMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all font-medium mt-1"
                      onClick={closeMenu}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
              <div className="px-3 py-2 mt-2">
                <ModeToggle />
              </div>
              {/* Mobile Search Bar */}
              <div className="mt-2">
                <div className="flex items-center relative">
                  <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-artswarit-purple text-sm w-full transition"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

