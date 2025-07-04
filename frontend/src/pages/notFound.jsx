import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, ArrowLeft } from "lucide-react";

const Button = ({ children, className = "", onClick, disabled }) => (
  <button
    className={`px-4 py-2 font-medium rounded-md transition duration-150 ease-in-out ${
      disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95"
    } ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Route not found -", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 relative overflow-hidden">
      <div className="max-w-3xl text-center space-y-10">
        {/* 404 image & heading */}
        <div className="relative w-full">
          <img
            src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop&crop=center"
            alt="404 visual"
            className="w-80 h-60 mx-auto object-cover rounded-xl shadow-xl opacity-25 dark:opacity-10"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 animate-pulse">
              404
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="mt-3 text-base md:text-lg text-gray-600 dark:text-gray-300">
            The page you're trying to access doesn't exist or has moved.
            Let’s guide you back to where you belong.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/home">
            <Button className="bg-primary text-neutral shadow hover:bg-neutral hover:text-primary flex items-center gap-2">
              <Home size={18} />
              Back to Home
            </Button>
          </Link>

          <Link to="/explore">
            <Button className="bg-primary text-neutral shadow hover:bg-neutral hover:text-primary flex items-center gap-2">
              <Search size={18} />
              Explore Articles
            </Button>
          </Link>
        </div>

        {/* Go Back */}
        <div>
          <Button
            onClick={() => window.history.back()}
            className="bg-primary text-neutral shadow hover:bg-neutral hover:text-primary flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
        </div>
      </div>

      {/* Decorative Bubbles (Extended) */}
      <div className="absolute top-1/2 left-5 w-10 h-10 bg-yellow-300 dark:bg-yellow-800 rounded-full opacity-20 animate-ping delay-700" />
      <div className="absolute top-20 right-1/4 w-16 h-16 bg-pink-300 dark:bg-pink-800 rounded-full opacity-20 animate-ping delay-1000" />
      <div className="absolute bottom-20 left-1/3 w-14 h-14 bg-cyan-300 dark:bg-cyan-800 rounded-full opacity-20 animate-ping delay-300" />
      <div className="absolute top-2/3 right-8 w-10 h-10 bg-emerald-300 dark:bg-emerald-800 rounded-full opacity-20 animate-ping delay-500" />
      <div className="absolute bottom-5 left-16 w-12 h-12 bg-indigo-300 dark:bg-indigo-800 rounded-full opacity-20 animate-ping delay-1200" />
      <div className="absolute top-[10%] right-[15%] w-16 h-16 bg-rose-300 dark:bg-rose-800 rounded-full opacity-20 animate-ping delay-900" />
      <div className="absolute bottom-[15%] right-[25%] w-14 h-14 bg-lime-300 dark:bg-lime-800 rounded-full opacity-20 animate-ping delay-600" />
      <div className="absolute bottom-50 left-60 w-15 h-14 bg-indigo-300 dark:bg-indigo-800 rounded-full opacity-20 animate-ping delay-1500" />
      <div className="absolute top-[10%] right-[65%] w-12 h-12 bg-rose-300 dark:bg-rose-800 rounded-full opacity-20 animate-ping delay-800" />
      <div className="absolute bottom-[85%] right-[85%] w-10 h-10 bg-lime-300 dark:bg-lime-800 rounded-full opacity-20 animate-ping delay-400" />

    </div>
  );
};

export default NotFound;
