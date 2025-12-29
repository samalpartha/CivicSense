import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import LoginDialog from "./LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <Logo />
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { name: 'Home', path: '/' },
                { name: 'Live Alerts', path: '/live-alerts' },
                { name: 'Map', path: '/map' },
                { name: 'About', path: '/about' },
              ].map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-sm font-medium px-3 py-2 rounded-md transition-all ${isActive
                      ? 'text-blue-700 bg-blue-50 font-bold'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <div className="h-6 w-px bg-gray-200 mx-2"></div>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-4 rounded-full hover:bg-gray-100">
                      <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                        {user?.name?.charAt(0) || <User size={14} />}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <span className="text-xs text-gray-500">{user?.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Badge variant="outline" className="text-xs font-normal">
                        {user?.userType}
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setShowLogin(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 shadow-sm"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden pb-4">
              <div className="space-y-1">
                <Link
                  to="/"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/live-alerts"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Live Alerts
                </Link>
                <Link
                  to="/map"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Map
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>

                <div className="pt-4 border-t">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-600">
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-xs">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLogin(true);
                        setIsOpen(false);
                      }}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
};

export default Navbar;
