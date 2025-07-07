import { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { CheckCircle, ArrowRight, Moon, Sun, Settings } from "lucide-react";
import useDataContext from "../hooks/useDataContext";
import { useAuth } from "../context/authContext";
import { setInterests } from "../api/profile";
import { toast } from "react-hot-toast";

const newsCategories = [
  { id: "technology", label: "Technology", emoji: "💻", description: "Latest in tech and innovation" },
  { id: "business", label: "Business", emoji: "💼", description: "Markets, startups, and economy" },
  { id: "politics", label: "Politics", emoji: "🏛", description: "Government and political news" },
  { id: "health", label: "Health", emoji: "🏥", description: "Medical and wellness updates" },
  { id: "science", label: "Science", emoji: "🔬", description: "Research and discoveries" },
  { id: "sports", label: "Sports", emoji: "⚽", description: "Games, leagues, and athletes" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬", description: "Movies, TV, and celebrity news" },
  { id: "world", label: "World News", emoji: "🌍", description: "International and global events" },
  { id: "finance", label: "Finance", emoji: "💰", description: "Personal finance and investing" },
  { id: "lifestyle", label: "Lifestyle", emoji: "✨", description: "Fashion, beauty, and living" },
  { id: "travel", label: "Travel", emoji: "✈", description: "Destinations and travel tips" },
  { id: "food", label: "Food & Dining", emoji: "🍽", description: "Recipes and restaurant reviews" },
  { id: "environment", label: "Environment", emoji: "🌱", description: "Climate and sustainability" },
  { id: "education", label: "Education", emoji: "📚", description: "Learning and academic news" },
  { id: "automotive", label: "Automotive", emoji: "🚗", description: "Cars and transportation" }
];

const UserPreferences = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { handleToggleTheme, isDarkMode } = useDataContext();
  const navigate = useNavigate();
  const { setLogin } = useAuth();

  // protect userPreferences route
  // ->>
  const location = useLocation();
  
  useEffect(() => {
    const verified = location.state?.verified;
  },[]);


  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSaveAndContinue = async () => {
    if (selectedCategories.length < 3) {
      alert("Please select at least 3 categories for better personalization.");
      return;
    }
    try{
      // Save selected categories to user profile
      const response = await setInterests(selectedCategories,setLogin);
      if(response.success){
        toast.success("Preferences saved successfully!");
      }
      else{
        toast.error("Failed to save preferences. Please try again.");
      }
    }
    catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("An error occurred while saving preferences.");
      return;
    }
    navigate("/home");
  };

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
            Personalize Your News Experience
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Choose your interests to get personalized news articles tailored just for you.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-neutral rounded-xl border border-input shadow-lg">
          {/* Card Header */}
          <div className="p-6 pb-4 border-b border-input">
            <h2 className="text-xl font-semibold text-primary">Choose Your Interests</h2>
            <p className="text-sm text-secondary mt-1">
              Select topics you're interested in. You can always change these later in your profile.
            </p>
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
                        <span className="font-medium text-primary">{category.label}</span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">{category.description}</p>
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
                    const category = newsCategories.find(cat => cat.id === categoryId);
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
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/home")}
            className="w-full sm:w-auto min-w-[140px]"
          >
            Skip for Now
          </Button>
          <Button
            size="lg"
            onClick={handleSaveAndContinue}
            disabled={selectedCategories.length === 0}
            className="w-full sm:w-auto min-w-[180px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save & Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Helper Text */}
        {selectedCategories.length > 0 && selectedCategories.length < 3 && (
          <div className="text-center mt-6">
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/20 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800 inline-flex">
              <CheckCircle className="w-4 h-4" />
              Select at least 3 categories for better personalization
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPreferences;