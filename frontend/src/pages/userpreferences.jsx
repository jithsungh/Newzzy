import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Moon,
  Sun,
  Settings,
  ArrowLeft,
} from "lucide-react";
import useDataContext from "../hooks/useDataContext";
import { useAuth } from "../context/authContext";
import { setInterests } from "../api/profile";
import { toastManager } from "../utils/toastManager";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";

const newsCategories = [
  {
    id: "technology",
    label: "Technology",
    emoji: "💻",
    description: "Latest in tech and innovation",
  },
  {
    id: "business",
    label: "Business",
    emoji: "💼",
    description: "Markets, startups, and economy",
  },
  {
    id: "politics",
    label: "Politics",
    emoji: "🏛",
    description: "Government and political news",
  },
  {
    id: "health",
    label: "Health",
    emoji: "🏥",
    description: "Medical and wellness updates",
  },
  {
    id: "science",
    label: "Science",
    emoji: "🔬",
    description: "Research and discoveries",
  },
  {
    id: "sports",
    label: "Sports",
    emoji: "⚽",
    description: "Games, leagues, and athletes",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    emoji: "🎬",
    description: "Movies, TV, and celebrity news",
  },
  {
    id: "world",
    label: "World News",
    emoji: "🌍",
    description: "International and global events",
  },
  {
    id: "finance",
    label: "Finance",
    emoji: "💰",
    description: "Personal finance and investing",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    emoji: "✨",
    description: "Fashion, beauty, and living",
  },
  {
    id: "travel",
    label: "Travel",
    emoji: "✈",
    description: "Destinations and travel tips",
  },
  {
    id: "food",
    label: "Food & Dining",
    emoji: "🍽",
    description: "Recipes and restaurant reviews",
  },
  {
    id: "environment",
    label: "Environment",
    emoji: "🌱",
    description: "Climate and sustainability",
  },
  {
    id: "education",
    label: "Education",
    emoji: "📚",
    description: "Learning and academic news",
  },
  {
    id: "automotive",
    label: "Automotive",
    emoji: "🚗",
    description: "Cars and transportation",
  },
];

const UserPreferences = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageContext, setPageContext] = useState("new"); // "new", "insufficient", "reset"
  const { handleToggleTheme, isDarkMode, setRecommendations } =
    useDataContext();
  const navigate = useNavigate();
  const { user, setLogin } = useAuth();
  const location = useLocation();
  
  // check whwete location. fromReet true or not
  useEffect(() => {
    const fromReset = location.state?.fromReset;
    if(!fromReset) {
      navigate("/home");
      return;
    }
  }, [location.state, navigate]);

  if (!user) {
    navigate("/login");
    return null; // Prevent rendering if user is not logged in
  }

  // useEffect(() => {
  //   const initializePreferences = () => {
  //     setIsLoading(true);
  //     try {
  //       // Check different scenarios for why user is on this page
  //       const verified = location.state?.verified; // New signup
  //       const fromHome = location.state?.fromHome; // Redirected from home due to insufficient interests
  //       const fromReset = location.state?.fromReset; // User clicked "Reset Interests" from profile
  //       const interestCount = location.state?.interestCount || 0;

  //       if (verified) {
  //         // New user after signup
  //         setPageContext("new");
  //       } else if (fromHome) {
  //         // Existing user with insufficient interests
  //         setPageContext("insufficient");
  //         toast.info(
  //           `You currently have ${interestCount} interest${
  //             interestCount !== 1 ? "s" : ""
  //           }. Please select at least 3 categories for better personalization.`
  //         );
  //       } else if (fromReset) {
  //         // User reset their interests from profile
  //         setPageContext("new");
  //         toast.info(
  //           "Your interests have been reset. Please select new categories to get personalized recommendations."
  //         );
  //       } else {
  //         // Default to insufficient interests case
  //         setPageContext("insufficient");
  //         toast.info(
  //           "Please select at least 3 categories for personalized recommendations."
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error initializing preferences:", error);
  //       toast.error("Failed to initialize preferences");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   initializePreferences();
  // }, [location.state]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSaveAndContinue = async () => {
    if (selectedCategories.length < 3) {
      toastManager.error(
        "Please select at least 3 categories for better personalization."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await setInterests(selectedCategories, setLogin);
      if (response.success) {
        toastManager.success("Preferences saved successfully!");

        // Navigate based on context
        const fromReset = location.state?.fromReset;
        setRecommendations([]);
        navigate("/home", { replace: true });
      } else {
        toastManager.error("Failed to save preferences. Please try again.");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toastManager.error("An error occurred while saving preferences.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    if (pageContext === "insufficient") {
      navigate("/home");
    } else {
      navigate("/profile");
    }
  };

  const getPageTitle = () => {
    switch (pageContext) {
      case "new":
        return "Welcome! Let's Personalize Your Experience";
      case "insufficient":
        return "Complete Your Interests";
      case "reset":
        return "Update Your Interests";
      default:
        return "Personalize Your News Experience";
    }
  };

  const getPageDescription = () => {
    switch (pageContext) {
      case "new":
        return "Choose your interests to get personalized news articles tailored just for you.";
      case "insufficient":
        return "You need at least 3 interests selected to get personalized recommendations.";
      case "reset":
        return "Update your interests to refine your personalized news feed.";
      default:
        return "Choose your interests to get personalized news articles tailored just for you.";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg mb-4"></span>
          <p className="text-secondary">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Top Right Theme Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleToggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral border border-input hover:bg-secondary transition-colors shadow-sm"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-blue-600" />
            )}
          </button>
        </div>

        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {getPageTitle()}
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            {getPageDescription()}
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-neutral rounded-xl border border-input shadow-lg">
          {/* Card Header */}
          <div className="p-6 pb-4 border-b border-input">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-primary">
                  Choose Your Interests
                </h2>
                <p className="text-sm text-secondary mt-1">
                  Select topics you're interested in. Your interests will be
                  updated automatically based on articles you like.
                </p>
              </div>
              {pageContext === "insufficient" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoBack}
                  className="shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              )}
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6">
            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {newsCategories.map((category) => (
                <div
                  key={category.id}
                  className={`group relative p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedCategories.includes(category.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-200 dark:ring-blue-800"
                      : "border-input bg-base-100 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/10"
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      className="mt-1 pointer-events-none text-green-500 hover:bg-blue-50 dark:hover:bg-blue-950/10"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{category.emoji}</span>
                        <span className="font-medium text-primary">
                          {category.label}
                        </span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  {selectedCategories.includes(category.id) && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Selected Categories Summary */}
            {selectedCategories.length > 0 && (
              <div className="p-4 bg-base-100 rounded-lg border border-input">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-primary">
                    {selectedCategories.length} categories selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryId) => {
                    const category = newsCategories.find(
                      (cat) => cat.id === categoryId
                    );
                    return (
                      <Badge
                        key={categoryId}
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-0"
                      >
                        {category?.emoji} {category?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          {pageContext === "new" && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleSkip}
              className="w-full sm:w-auto min-w-[140px]"
              disabled={isLoading}
            >
              Skip for Now
            </Button>
          )}
          <Button
            size="lg"
            onClick={handleSaveAndContinue}
            disabled={selectedCategories.length === 0 || isLoading}
            className="w-full sm:w-auto min-w-[180px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Saving...
              </>
            ) : (
              <>
                Save & Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Helper Text */}
        {selectedCategories.length > 0 && selectedCategories.length < 3 && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
              <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Select at least 3 categories for better personalization
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPreferences;
