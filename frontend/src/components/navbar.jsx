import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Home,
  Compass,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  Flame,
} from "lucide-react";
import { useAuth } from "../context/authContext";
import useDataContext from "../hooks/useDataContext";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const hideTimeoutRef = useRef(null);
  const currentPath = location.pathname;

  const { user, setLogin } = useAuth();
  const { streak, isDarkMode, handleToggleTheme } = useDataContext();

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Reset search query when navigating to a new page
    if (currentPath !== "/search") {
      setSearchQuery("");
    }

    // Scroll to top when navigating to a new page
    window.scrollTo(0, 0);

    // Reset navbar visibility state and scroll position
    setIsVisible(true);
    setLastScrollY(0);

    // Clear any existing timeouts
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, [currentPath]);

  // Effect to handle mobile menu state changes
  useEffect(() => {
    if (isOpen) {
      // Keep navbar visible when mobile menu is open
      setIsVisible(true);
      // Clear any hide timeouts
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    } else {
      // When mobile menu closes, set a timeout to hide if scrolled down
      if (window.scrollY > 10) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
    }
  }, [isOpen]);

  // Scroll handler for auto-hide functionality
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Don't hide navbar if mobile menu is open
      if (isOpen) {
        setIsVisible(true);
        return;
      }

      // Show navbar when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);

        // Clear any existing timeout
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        // Set new timeout to hide after 3 seconds of inactivity
        hideTimeoutRef.current = setTimeout(() => {
          if (window.scrollY > 10 && !isOpen) {
            setIsVisible(false);
          }
        }, 3000);
      }
      // Hide navbar when scrolling down (but not immediately)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Clear timeout when actively scrolling down
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Mouse movement handler to show navbar
    const handleMouseMove = (e) => {
      // Show navbar when mouse is near the top (within 100px)
      if (e.clientY < 100) {
        setIsVisible(true);

        // Clear any existing timeout
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        // Set new timeout to hide after 3 seconds
        hideTimeoutRef.current = setTimeout(() => {
          if (window.scrollY > 10 && !isOpen) {
            setIsVisible(false);
          }
        }, 3000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [lastScrollY, isOpen]);

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
      currentPath === path
        ? "bg-primary text-base-100"
        : "text-secondary hover:bg-neutral hover:text-primary"
    }`;

  const mobileLinkClass = (path) =>
    `px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 ${
      currentPath === path
        ? "bg-primary text-base-100"
        : "text-secondary hover:bg-neutral hover:text-primary"
    }`;

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false); // close mobile menu on submit
    }
  };

  const handleNavbarMouseEnter = () => {
    setIsVisible(true);
    // Clear any existing timeout when hovering
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const handleNavbarMouseLeave = () => {
    // Set timeout to hide after leaving navbar (only if scrolled down and mobile menu is closed)
    if (window.scrollY > 10 && !isOpen) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    }
  };

  return (
    <nav
      className={`bg-neutral shadow-lg w-full fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      onMouseEnter={handleNavbarMouseEnter}
      onMouseLeave={handleNavbarMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            {isDarkMode ? (
              <img
                src="/Newzzy-logo-dark.png"
                alt="Newzzy Logo"
                className="h-10"
              />
            ) : (
              <img
                src="/Newzzy-logo-light.png"
                alt="Newzzy Logo"
                className="h-10"
              />
            )}
          </Link>

          {/* Logo
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">Newzzy</span>
            </Link>
          </div>*/}

          {/* Desktop Search */}
          <div className="relative w-96 max-w-full mr-8 hidden md:block">
            <form onSubmit={handleSearchSubmit}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                size={20}
              />
              <input
                type="text"
                placeholder="Search articles, topics, creators..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-md pl-10 pr-3 py-2 bg-base-100 text-primary placeholder:text-secondary border border-border focus:ring-2 ring-muted transition-all duration-200"
              />
            </form>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-4">
            {user && (
              <Link to="/home" className={linkClass("/home")}>
                <Home size={18} />
                <span>Home</span>
              </Link>
            )}
            <Link to="/explore" className={linkClass("/explore")}>
              <Compass size={18} />
              <span>Explore</span>
            </Link>
            {user && (
              <Link to="/profile" className={linkClass("/profile")}>
                <User size={18} />
                <span>Profile</span>
              </Link>
            )}
            <div className="bg-accent/20 text-orange-500 text-lg hover:bg-accent/10 transition-colors rounded-full px-3 py-1 flex items-center space-x-2">
              <Flame size={18} className="fill-orange-500 text-orange-500" />
              <span>{user ? streak : 0}</span>
            </div>
            {!user && (
              <>
                <Link to="/signup" className={linkClass("/signup")}>
                  <span>SignUp</span>
                </Link>
                <Link to="/login" className={linkClass("/login")}>
                  <span>Login</span>
                </Link>
              </>
            )}
            <button
              onClick={handleToggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-secondary transition-colors"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-blue-800" />
              )}
            </button>
          </div>

          {/* Mobile Toggle Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-primary hover:bg-neutral focus:outline-none focus:ring-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="px-4 pt-2 pb-3 space-y-2">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
              size={18}
            />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-md pl-10 pr-3 py-2 bg-base-100 text-primary placeholder:text-secondary border border-border focus:ring-2 ring-muted transition-all duration-200"
            />
          </form>

          {user && (
            <Link
              to="/home"
              onClick={() => setIsOpen(false)}
              className={mobileLinkClass("/home")}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
          )}
          <Link
            to="/explore"
            onClick={() => setIsOpen(false)}
            className={mobileLinkClass("/explore")}
          >
            <Compass size={18} />
            <span>Explore</span>
          </Link>
          {user && (
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={mobileLinkClass("/profile")}
            >
              <User size={18} />
              <span>Profile</span>
            </Link>
          )}
          <div className="bg-accent/50 text-secondary hover:bg-accent/70 transition-colors rounded-md px-3 py-2 flex items-center space-x-2">
            <Flame size={18} />
            <span>{user ? streak : 0}</span>
          </div>
          {!user && (
            <>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className={mobileLinkClass("/signup")}
              >
                <span>SignUp</span>
              </Link>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className={mobileLinkClass("/login")}
              >
                <span>Login</span>
              </Link>
            </>
          )}
          <button
            onClick={() => {
              handleToggleTheme();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-secondary hover:bg-neutral hover:text-primary"
          >
            {isDarkMode ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} className="text-blue-500" />
            )}
            <span>Toggle Theme</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
