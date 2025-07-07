import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import  ArticleCard from "../components/articleCard";
import ArticlePopup from "../components/articlePopup";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import { TrendingUp, Filter } from "lucide-react";
import { cn } from "../lib/utils";

import useDataContext from "../hooks/useDataContext";


const keywords = [
  "politics",
  "world",
  "business",
  "technology",
  "science",
  "health",
  "sports",
  "entertainment",
  "finance",
  "education",
  "crime",
  "climate change",
  "economy",
  "elections",
  "covid-19",
  "travel",
  "weather",
  "startup",
  "law",
  "culture",
];


function ExplorePage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("trending now");
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(null);
  const menuItems = ["all", "trending now", ...keywords];

  const { latestArticles, trendingArticles, fetchLatestArticles, fetchLatestTrendingArticles } = useDataContext();

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
    fetchLatestArticles();
    fetchLatestTrendingArticles();
  }, []);
   
  const getFilteredArticles = () => {
    if (selectedCategory === "all") return latestArticles; // return all latest articles
    if (selectedCategory === "trending now") return trendingArticles; // return all trending articles
    return latestArticles.filter((article) => article.keywords.includes(selectedCategory)); // apply filter on latest articles
  }; 
  
  React.useEffect(() => {
    setFilteredArticles(getFilteredArticles());
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
          {filteredArticles.length > 0 ? (
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
