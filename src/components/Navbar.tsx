
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Settings, TrendingUp, Radio, FolderOpen, Heart, CreditCard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import LogoWithName from './LogoWithName';
import { NotificationCenter } from './notifications/NotificationCenter';
import { useProfile } from '@/hooks/useProfile';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigationLinks = [
    { href: '/explore', label: 'Explore' },
    { href: '/explore-artists', label: 'Artists' },
    { href: '/categories', label: 'Categories' },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/live-streaming', label: 'Live', icon: Radio },
    { href: '/collections', label: 'Collections', icon: FolderOpen },
    { href: '/recommendations', label: 'For You', icon: Heart },
    { href: '/commissions', label: 'Commissions', icon: CreditCard },
  ];

  const getDashboardLink = () => {
    if (!profile) return '/client-dashboard';
    
    switch (profile.role) {
      case 'artist':
      case 'premium':
        return '/artist-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/client-dashboard';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <LogoWithName />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <NotificationCenter />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="flex-col items-start">
                    <div className="text-sm font-medium">{profile?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{profile?.email}</div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/artist-dashboard/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      {link.label}
                    </Link>
                  );
                })}
                
                {user ? (
                  <>
                    <hr className="my-4" />
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="justify-start text-lg font-medium text-gray-700 hover:text-blue-600"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <hr className="my-4" />
                    <Link
                      to="/login"
                      className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
