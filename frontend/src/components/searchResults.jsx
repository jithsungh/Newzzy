import { useState, useEffect } from "react";
import ArticleCard from "./articleCard";
import ArticlePopup from "./articlePopup";
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import useDataContext from "../hooks/useDataContext";

const SearchResults = ({ searchQuery, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(null);

  const { fetchArticlesByKeyword, filteredArticles ,setFilteredArticles } = useDataContext();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArticles([]);
      return;
    }
    fetchArticlesByKeyword(searchQuery);
  }, [searchQuery]);

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

  if (!searchQuery.trim()) return null;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Search size={24} className="text-primary" />
            <h1 className="text-3xl font-bold">
              Search Results for "{searchQuery}"
            </h1>
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">
              Found {filteredArticles.length} article
              {filteredArticles.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard
                onClick={handleOnClick}
                key={article._id}
                article={article}
              />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Search size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No articles found</h2>
            <p className="text-muted-foreground text-lg">
              No articles found for "{searchQuery}"
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try searching for different keywords or browse our trending articles
            </p>
            <Link
              to="/explore"
              className="inline-block mt-6 px-6 py-3 bg-primary text-neutral rounded-md hover:bg-primary/90 transition-colors"
            >
              Explore Trending Articles
            </Link>
          </div>
        )}
      </div>
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
};

export default SearchResults;
