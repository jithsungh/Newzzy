import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import { logout } from "../api/auth";
import toast from "react-hot-toast";
import ArticleCard from "../components/articleCard.jsx";
import ArticlePopup from "../components/articlePopup.jsx";
import { RefreshCcw } from "lucide-react";


import useDataContext from "../hooks/useDataContext";

const HomePage = () => {
  const { recommendations, fetchRecommendations, handleRefresh } = useDataContext();
  const { user, setLogout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [likedArticles, setLikedArticles] = useState([]);
  const [dislikedArticles, setDislikedArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
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

  useEffect(() => {
    if(recommendations.length === 0 ) {
      fetchRecommendations();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

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
          <button className="btn btn-primary" onClick={handleRefresh}>
            <RefreshCcw /> Refresh
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-6">
        {recommendations && recommendations.length > 0 ? (
          recommendations.map((article) => (
            
              <ArticleCard
                key={article._id}
                onClick={handleOnClick}
                article={article} 
              />
          ))
        ) : (
          <p>No recommendations available at the moment.</p>
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
        />
      )}
    </div>
  );
};

export default HomePage;
