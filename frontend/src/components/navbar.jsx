import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Home, Compass, User, Menu, X, Sun, Moon, Search } from "lucide-react";
import { toggleTheme } from "../api/profile";
import { useAuth } from "../context/authContext";
import useDataContext from "../hooks/useDataContext";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = location.pathname;

  const { user, setLogin } = useAuth();
  const { currentTheme, setCurrentTheme } = useDataContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const navigate = useNavigate();

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

  const handleToggleTheme = async () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    console.log(newTheme);
    setCurrentTheme(newTheme);
    if(user){
      await toggleTheme(newTheme, setLogin);
    }
    setIsDarkMode(currentTheme === "dark");
    // window.location.reload(); // optional: remove if using context/localStorage for theme
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Search submitted:", searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  return (
    <nav className="bg-neutral shadow-lg w-full ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">NewsApp</span>
            </Link>
          </div>
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

          {/* Desktop menu */}
          <div className="hidden sm:flex items-center space-x-4">
            { user && (
              <Link to="/home" className={linkClass("/home")}>
                <Home size={18} />
                <span>Home</span>
              </Link>  
            )}
            <Link to="/explore" className={linkClass("/explore")}>
              <Compass size={18} />
              <span>Explore</span>
            </Link>
            
            { user && (
            <Link to="/profile" className={linkClass("/profile")}>
              <User size={18} />
              <span>Profile</span>
            </Link>
            )}
            { !user && (
            <Link to="/signup" className={linkClass("/signup")}>
              <span>SignUp</span>
            </Link>
            )}
            { !user && (
            <Link to="/login" className={linkClass("/login")}>
              <span>Login</span>
            </Link>
            )}
            {/* Theme toggle button */}
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

          {/* Mobile toggle button */}
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

      {/* Mobile menu */}
      <div className={`${isOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={mobileLinkClass("/")}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link
            to="/explore"
            onClick={() => setIsOpen(false)}
            className={mobileLinkClass("/explore")}
          >
            <Compass size={18} />
            <span>Explore</span>
          </Link>
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className={mobileLinkClass("/profile")}
          >
            <User size={18} />
            <span>Profile</span>
          </Link>

          {/* Mobile theme toggle */}
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
