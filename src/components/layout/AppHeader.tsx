
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, UserCircle, Menu, X } from 'lucide-react';

const AppHeader: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle logout with event parameter
  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-islamic-primary shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-white text-2xl font-bold">
            <span className="hidden sm:inline">Quran Classes</span>
            <span className="sm:hidden">QC</span>
            <span className="text-islamic-accent">Manager</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-white hover:text-islamic-accent transition-colors">
                Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-white hover:text-islamic-accent transition-colors">
                  Admin Panel
                </Link>
              )}
              <Link to="/applications" className="text-white hover:text-islamic-accent transition-colors">
                Applications
              </Link>
              <Link to="/check-status" className="text-white hover:text-islamic-accent transition-colors">
                Check Status
              </Link>
            </>
          )}
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-islamic-accent/20 text-white hover:bg-islamic-accent/30">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                    <span className="text-xs font-medium capitalize text-islamic-accent">{user?.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="default" className="bg-islamic-accent text-islamic-primary hover:bg-islamic-accent/90">
                Login
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 bg-islamic-primary border-t border-islamic-accent/20">
          <div className="container space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-white">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-sm text-white/70">{user?.email}</div>
                  <div className="text-xs font-medium capitalize text-islamic-accent">{user?.role}</div>
                </div>
                <div className="border-t border-islamic-accent/20 pt-2">
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 text-white hover:bg-islamic-accent/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="block px-3 py-2 text-white hover:bg-islamic-accent/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link 
                    to="/applications" 
                    className="block px-3 py-2 text-white hover:bg-islamic-accent/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Applications
                  </Link>
                  <Link 
                    to="/check-status" 
                    className="block px-3 py-2 text-white hover:bg-islamic-accent/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Check Status
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block px-3 py-2 text-white hover:bg-islamic-accent/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                </div>
                <button
                  className="block w-full px-3 py-2 text-left text-white hover:bg-islamic-accent/20 border-t border-islamic-accent/20"
                  onClick={handleLogout}
                >
                  <div className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </div>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="block px-3 py-2 text-white hover:bg-islamic-accent/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
