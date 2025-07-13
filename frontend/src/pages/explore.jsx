import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import ArticleCard from "../components/ArticleCard.jsx";
import ArticlePopup from "../components/ArticlePopup";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import { TrendingUp, Filter } from "lucide-react";
import { cn } from "../lib/utils";
import LoadingSpinner from "../components/ui/LoadingSpinner";

import useDataContext from "../hooks/useDataContext";

const keywords = [
  "technology",
  "business",
  "politics",
  "health",
  "science",
  "sports",
  "entertainment",
  "world",
  "finance",
  "lifestyle",
  "travel",
  "food",
  "environment",
  "education",
  "automotive",
];

function ExplorePage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("trending now");
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const menuItems = ["all", "trending now", ...keywords];

  const {
    latestArticles,
    trendingArticles,
    fetchLatestArticles,
    fetchLatestTrendingArticles,
    loading,
  } = useDataContext();

  const handleOpenPopUp = () => {
    setIsOpen(true);
  };
  const handleClosePopUp = () => {
    setIsOpen(false);
  };
  const handleOnClick = (article) => {
    const index = filteredArticles.findIndex((a) => a._id === article._id);
    setCurrentArticleIndex(index);
    setIsOpen(true);
  };

  const handlePopupNext = () => {
    if (
      currentArticleIndex !== null &&
      currentArticleIndex < filteredArticles.length - 1
    ) {
      setCurrentArticleIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePopupPrev = () => {
    if (currentArticleIndex !== null && currentArticleIndex > 0) {
      setCurrentArticleIndex((prevIndex) => prevIndex - 1);
    }
  };

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        await fetchLatestArticles();
        await fetchLatestTrendingArticles();
      } catch (error) {
        console.error("Error loading articles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getFilteredArticles = () => {
    if (selectedCategory === "all") return latestArticles; // return all latest articles
    if (selectedCategory === "trending now") return trendingArticles; // return all trending articles
    return latestArticles.filter((article) =>
      article.keywords.includes(selectedCategory)
    ); // apply filter on latest articles
  };

  React.useEffect(() => {
    setFilteredArticles([]); // Reset filtered articles on category change
    setIsLoading(true);
    // Filter articles based on selected category
    setFilteredArticles(getFilteredArticles());
    // Reset loading when articles are available
    if (filteredArticles.length > 0) {
      setIsLoading(false);
    }
  }, [latestArticles, trendingArticles, selectedCategory]);

  const handleLike = () => {
    console.log("Like button clicked");
  };

  const handleDislike = () => {
    console.log("Dislike button clicked");
  };

  const handleSave = () => {
    console.log("Save button clicked");
  };

  const handleShare = () => {
    console.log("Share button clicked");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-primary" size={28} />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Explore Trending News
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground">
          Discover trending news articles across different categories and topics
        </p>
      </div>

      <div className="mb-6 sm:mb-8">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-4">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setSelectedCategory(item)}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  selectedCategory === item
                    ? "bg-primary text-neutral shadow-md"
                    : "bg-neutral text-primary hover:bg-secondary/80 hover:shadow-sm"
                )}
              >
                {item === "trending now" && (
                  <TrendingUp size={16} className="mr-2" />
                )}
                {item === "all" && <Filter size={16} className="mr-2" />}
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {selectedCategory === "all" && (
              <>
                <Filter size={20} /> All Articles
              </>
            )}
            {selectedCategory === "trending now" && (
              <>
                <TrendingUp size={20} /> Trending Articles
              </>
            )}
            {selectedCategory !== "all" &&
              selectedCategory !== "trending now" && (
                <>
                  <Filter size={20} />{" "}
                  {selectedCategory.charAt(0).toUpperCase() +
                    selectedCategory.slice(1)}{" "}
                  Articles
                </>
              )}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredArticles.length} articles)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || loading ? (
            <div className="space-y-6">
              {/* Beautiful loading header */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                  </div>

                  <span className="text-lg font-medium text-primary animate-pulse">
                    Loading latest content for you...
                  </span>
                </div>
              </div>

              {/* Beautiful skeleton grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="group bg-neutral rounded-xl border border-input shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image skeleton */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 animate-pulse">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      <div className="absolute bottom-3 left-3 w-16 h-4 bg-white/30 rounded-full animate-pulse"></div>
                    </div>

                    {/* Content skeleton */}
                    <div className="p-4 space-y-3">
                      {/* Title skeleton */}
                      <div className="space-y-2">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/4 animate-pulse"></div>
                      </div>

                      {/* Description skeleton */}
                      <div className="space-y-1">
                        <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded w-5/6 animate-pulse"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded w-2/3 animate-pulse"></div>
                      </div>

                      {/* Action buttons skeleton */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full animate-pulse"></div>
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full animate-pulse"></div>
                          <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full animate-pulse"></div>
                        </div>
                        <div className="h-3 w-16 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard
                  onClick={handleOnClick}
                  key={article._id}
                  article={article}
                  handleLike={handleLike}
                  handleDislike={handleDislike}
                  handleSave={handleSave}
                  handleShare={handleShare}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No articles found for "{selectedCategory}" category
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try selecting a different category or check back later
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {isOpen && currentArticleIndex !== null && (
        <ArticlePopup
          isOpen={isOpen}
          onClose={handleClosePopUp}
          article={filteredArticles[currentArticleIndex]}
          onPrev={currentArticleIndex > 0 ? handlePopupPrev : null}
          onNext={
            currentArticleIndex < filteredArticles.length - 1
              ? handlePopupNext
              : null
          }
          isRecommendation={false}
        />
      )}
    </div>
  );
}

export default ExplorePage;
