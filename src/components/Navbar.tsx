
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
import { Home, Users, Search as SearchIcon } from "lucide-react";

const menuItems = [
  {
    name: "Home",
    path: "/",
    icon: <Home size={18} />,
  },
  {
    name: "Artist",
    path: "/explore-artists",
    icon: <Users size={18} />,
  },
  {
    name: "Explore",
    path: "/explore",
    icon: <SearchIcon size={18} />,
  },
];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Minimal search bar
  const renderSearchBar = (
    <div className="hidden md:flex items-center relative ml-4">
      <input
        type="text"
        placeholder="Search…"
        className="pl-8 pr-2 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-sm focus:outline-none transition-all focus:ring-artswarit-purple focus:ring-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
    </div>
  );

  return (
    <nav className="bg-white/70 glass-effect shadow-lg border-b border-gray-100 fixed w-full top-0 z-50 backdrop-blur-md transition-all">
      <div className="container max-w-screen-xl mx-auto px-2 md:px-4 h-12 flex items-center">
        {/* Logo */}
        <Link
          to="/"
          className="font-bold text-lg text-purple-600 mr-3 tracking-tight hover:opacity-80 transition-opacity"
        >
          Artswarit
        </Link>

        {/* Minimal desktop nav */}
        <div className="hidden md:flex items-center space-x-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium text-sm transition-all hover:bg-purple-50 hover:text-purple-600
                ${location.pathname === item.path ? "text-purple-600 bg-purple-100" : "text-gray-700"}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Minimal search + user/auth buttons (right side) */}
        <div className="flex items-center ml-auto gap-2">
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
              <DropdownMenuContent className="w-44 z-50 bg-white backdrop-blur-sm border border-gray-200" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link to={user.user_metadata?.role === "artist" ? "/artist-dashboard" : "/client-dashboard"}>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-purple-600 font-medium px-2 py-1 rounded-lg text-sm transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-purple-600 text-white rounded-lg px-3 py-1.5 font-medium text-sm hover:bg-purple-700 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
          <ModeToggle />
        </div>

        {/* Mobile menu button */}
        {isMobile && (
          <div className="flex items-center space-x-1 ml-auto">
            {user && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                <AvatarFallback>{user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <Button variant="ghost" onClick={toggleMenu} className="h-8 w-8 p-0">
              {/* mobile menu icon */}
              <span className="sr-only">Toggle Menu</span>
              <svg width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" viewBox="0 0 24 24">
                {isOpen
                  ? <line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" />  // close icon
                  : <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></> // burger
                }
              </svg>
            </Button>
          </div>
        )}
      </div>

      {/* Minimal Mobile Menu */}
      {isMobile && isOpen && (
        <>
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/90 z-50 border-b border-gray-200 shadow transition-all animate-fade-in backdrop-blur">
            <div className="px-4 py-2 space-y-1">
              {menuItems.map((item) => (
                <Link
                  to={item.path}
                  key={item.name}
                  className={`flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-base
                    ${location.pathname === item.path ? "text-purple-600 bg-purple-100" : ""}`}
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
              {/* Minimal Mobile Search */}
              <div className="mt-2">
                <div className="flex items-center relative">
                  <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search…"
                    className="pl-9 pr-4 py-1 rounded-full border border-gray-200 bg-white/70 focus:outline-none focus:ring-artswarit-purple focus:ring-2 text-sm w-full transition"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="px-3 py-2 mt-2">
                <ModeToggle />
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
