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

  // Underline effect for nav links (no background)
  const linkBaseClass =
    "relative flex items-center gap-1 px-3 py-1.5 font-medium text-sm rounded transition-all before:absolute before:inset-x-2 before:bottom-0 before:h-0.5 before:bg-purple-600 before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:duration-300";
  const linkActiveClass =
    "text-purple-600 before:scale-x-100";
  const linkInactiveClass =
    "text-gray-700 before:bg-gray-300 hover:text-purple-600";

  return (
    <nav className="bg-white/70 glass-effect shadow-lg border-b border-gray-100 fixed w-full top-0 z-50 backdrop-blur-md transition-all">
      <div className="container max-w-screen-xl mx-auto px-2 md:px-4 h-12 flex items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-4 font-bold text-lg text-purple-600 mr-12 tracking-tight hover:opacity-80 transition-opacity"
        >
          <img
            src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
            alt="Artswarit Logo"
            className="h-12 w-12 md:h-16 md:w-16 object-contain transition-transform duration-300 hover:scale-110"
            style={{
              background: "none"
            }}
          />
        </Link>

        {/* Minimal desktop nav */}
        <div className="hidden md:flex items-center space-x-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={
                linkBaseClass +
                " " +
                (location.pathname === item.path
                  ? linkActiveClass
                  : linkInactiveClass)
              }
              style={{ marginLeft: "0.8rem", marginRight: "0.8rem" }}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Right side controls */}
        <div className="flex items-center ml-auto gap-2">
          {/* Dashboard link removed as requested */}
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
          {/* Remove ModeToggle component */}
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
              <span className="sr-only">Toggle Menu</span>
              <svg width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" viewBox="0 0 24 24">
                {isOpen
                  ? (
                    <>
                      <line x1="4" y1="4" x2="20" y2="20" />
                      <line x1="20" y1="4" x2="4" y2="20" />
                    </>
                  )
                  : (
                    <>
                      <line x1="4" y1="7" x2="20" y2="7" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="17" x2="20" y2="17" />
                    </>
                  )
                }
              </svg>
            </Button>
          </div>
        )}
      </div>

      {/* Minimal Mobile Menu */}
      {(isMobile && isOpen) && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/90 z-50 border-b border-gray-200 shadow transition-all animate-fade-in backdrop-blur">
          <div className="px-4 py-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                to={item.path}
                key={item.name}
                className={
                  "relative flex items-center gap-2 px-3 py-2 text-base font-medium rounded-lg transition-colors " +
                  (location.pathname === item.path
                    ? "text-purple-600 after:absolute after:left-3 after:right-3 after:bottom-0 after:h-0.5 after:bg-purple-600 after:rounded-full after:scale-x-100 after:transition-transform after:duration-300"
                    : "text-gray-700 after:bg-gray-300 hover:text-purple-600 after:absolute after:left-3 after:right-3 after:bottom-0 after:h-0.5 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300")
                }
                onClick={closeMenu}
                style={{ marginLeft: "0.6rem", marginRight: "0.6rem" }}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="mt-2">
              {/* Dashboard button removed as requested */}
              {user ? (
                <>
                  <Link
                    to={user.user_metadata?.role === "artist" ? "/artist-dashboard" : "/client-dashboard"}
                    className="block px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    Profile
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
            {/* Dashboard button replaces dark mode toggle */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
