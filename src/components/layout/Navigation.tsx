import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Menu, 
  X, 
  LogIn, 
  UserPlus,
  Phone,
  Info,
  BookOpen,
  CreditCard,
  HelpCircle
} from 'lucide-react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navigation = [
    { name: 'Features', href: '/features', icon: BookOpen },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  return (
    <nav className="fixed w-full bg-white z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-primary">Rate Monitor Pro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link 
                key={item.name}
                to={item.href} 
                className="text-gray-500 hover:text-gray-900"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4">
              <Link
                to="/auth"
                className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
              <Link
                to="/auth?signup=true"
                className="flex items-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile menu panel */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <span className="text-lg font-medium text-gray-900">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span className="sr-only">Close menu</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Menu items */}
        <div className="px-4 py-6 space-y-6 overflow-y-auto bg-white">
          {/* Navigation links */}
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3 text-gray-400" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Auth buttons */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <Link
              to="/auth"
              className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn className="h-5 w-5 mr-3 text-gray-400" />
              Sign In
            </Link>
            <Link
              to="/auth?signup=true"
              className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}