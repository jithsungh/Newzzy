import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { Navigate, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { toastManager } from "../utils/toastManager";
import ArticleCard from "../components/articleCard.jsx";
import ArticlePopup from "../components/articlePopup.jsx";
import { Button } from "../components/ui/button";
import { RefreshCcw } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";

import useDataContext from "../hooks/useDataContext";

const HomePage = () => {
  const {
    recommendations,
    setRecommendations,
    fetchRecommendations,
    handleRefresh,
  } = useDataContext();
  const { user, setLogout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [currentArticleIndex, setCurrentArticleIndex] = useState(null);

  const handleOpenPopUp = () => {
    setIsOpen(true);
  };
  const handleClosePopUp = () => {
    setIsOpen(false);
  };
  if (!user) {
    return <Navigate to="/login" />;
  }

  const checkAndFetchRecommendations = async () => {
    if (isLoading) return; // Prevent multiple simultaneous calls

    setIsLoading(true);
    try {
      const result = await fetchRecommendations();
      if (result && result.needsPreferences) {
        // User needs to set preferences
        toastManager.error(
          "Please set your interests to get personalized recommendations"
        );
        setRecommendations([]);
        navigate("/preferences", {
          state: {
            fromReset: true,
          },
        });
      }
    } catch (error) {
      console.error("Error checking recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("HomePage useEffect - checking recommendations");
    console.log("Current recommendations:", recommendations);
    setRecommendations(recommendations || []);
    if (!recommendations || recommendations.length === 0) {
      checkAndFetchRecommendations();
    }
  }, []);

  const handleOnClick = (article) => {
    const index = recommendations.findIndex((a) => a._id === article._id);
    setCurrentArticleIndex(index);
    setIsOpen(true);
  };

  const handlePopupNext = () => {
    if (
      currentArticleIndex !== null &&
      currentArticleIndex < recommendations.length - 1
    ) {
      setCurrentArticleIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePopupPrev = () => {
    if (currentArticleIndex !== null && currentArticleIndex > 0) {
      setCurrentArticleIndex((prevIndex) => prevIndex - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 pt-10">
      <div className="flex justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Hello, {user.name}</h2>
          <p className="text-secondary text-lg text-muted-foreground mb-8">
            Your personalized stories and updates, curated for you
          </p>
        </div>
        <div>
          <button
            className="btn btn-primary"
            onClick={async () => {
              const result = await handleRefresh();
              if (result && result.needsPreferences) {
                // User needs to set preferences
                toastManager.error(
                  result.message ||
                    "Please set your interests to get personalized recommendations"
                );
                navigate("/preferences", {
                  state: {
                    fromReset: true,
                  },
                });
              }
            }}
          >
            <RefreshCcw /> Refresh
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-6">
        {isLoading ? (
          // Loading state
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-neutral rounded-lg border border-input shadow-sm p-6 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))
        ) : recommendations && recommendations.length > 0 ? (
          recommendations.map((article) => (
            <ArticleCard
              key={article._id}
              onClick={handleOnClick}
              article={article}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-secondary text-lg mb-4">
              No recommendations available at the moment.
            </p>
            <Button
              onClick={checkAndFetchRecommendations}
              disabled={isLoading}
              className="bg-primary text-neutral hover:bg-neutral/80 hover:text-primary transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Loading...
                </>
              ) : (
                "Refresh Recommendations"
              )}
            </Button>
          </div>
        )}
      </div>
      {isOpen && currentArticleIndex !== null && (
        <ArticlePopup
          isOpen={isOpen}
          onClose={handleClosePopUp}
          article={recommendations[currentArticleIndex]}
          onPrev={currentArticleIndex > 0 ? handlePopupPrev : null}
          onNext={
            currentArticleIndex < recommendations.length - 1
              ? handlePopupNext
              : null
          }
          isRecommendation={true}
        />
      )}
    </div>
  );
};

export default HomePage;
