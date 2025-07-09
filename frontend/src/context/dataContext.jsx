// src/context/DataContext.jsx
import React, { createContext, useState, useEffect } from "react";
import {
  getLatestArticles,
  getLatestTrendingArticles,
  getArticleByKeyword,
  getLikedArticleIds,
  getDislikedArticleIds,
  getSavedArticleIds,
  getSavedArticles,
  likeArticle,
  dislikeArticle,
  saveArticle,
  shareArticle,
} from "../api/article";
import {
  getRecommendations,
  refreshRecommendations,
  markRecommendationAsRead,
} from "../api/recommendations";
import {
  getUser,
  getStreak,
  getRecentActivity,
  toggleTheme,
} from "../api/profile";
import { toast } from "react-hot-toast";
import { useAuth } from "./authContext";
import { useNavigate } from "react-router-dom";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [likedArticleIds, setLikedArticleIds] = useState([]);
  const [dislikedArticleIds, setDislikedArticleIds] = useState([]);
  const [savedArticleIds, setSavedArticleIds] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, setLogin } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(user?.theme || "light");
  const [isDarkMode, setIsDarkMode] = useState(currentTheme === "dark");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const response = await getStreak();
        if (response.success) {
          setStreak(response.data.streak || 0);
        } else {
          console.error("Failed to fetch user data:", userData.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [setLogin]);

  const handleLike = async (id) => {
    const isAlreadyLiked = likedArticleIds.includes(id);

    // Optimistically update liked articles
    setLikedArticleIds((prev) =>
      isAlreadyLiked ? prev.filter((aid) => aid !== id) : [...prev, id]
    );

    // Remove from disliked if newly liked
    if (!isAlreadyLiked) {
      setDislikedArticleIds((prev) => prev.filter((aid) => aid !== id));
    }

    try {
      const res = await likeArticle(id);
      if (!res.success) {
        // Revert on failure
        setLikedArticleIds((prev) =>
          isAlreadyLiked ? [...prev, id] : prev.filter((aid) => aid !== id)
        );
        toast.error(res.error || "Failed to update like status");
      } else {
        toast.success(isAlreadyLiked ? "Article Unliked!" : "Article Liked!");
      }
    } catch (error) {
      console.error("Error liking article:", error);
      toast.error("Failed to update like status");
    }
  };

  const handleDislike = async (id) => {
    const isAlreadyDisliked = dislikedArticleIds.includes(id);

    // Optimistically update disliked articles
    setDislikedArticleIds((prev) =>
      isAlreadyDisliked ? prev.filter((aid) => aid !== id) : [...prev, id]
    );

    // Remove from liked if newly disliked
    if (!isAlreadyDisliked) {
      setLikedArticleIds((prev) => prev.filter((aid) => aid !== id));
    }

    try {
      const res = await dislikeArticle(id);
      if (!res.success) {
        // Revert on failure
        setDislikedArticleIds((prev) =>
          isAlreadyDisliked ? [...prev, id] : prev.filter((aid) => aid !== id)
        );
        toast.error(res.error || "Failed to dislike article");
      } else {
        toast.success(
          isAlreadyDisliked ? "Article Undisliked!" : "Article Disliked!"
        );
      }
    } catch (error) {
      console.error("Error disliking article:", error);
      toast.error("Failed to update dislike status");
    }
  };

  const handleSave = async (id) => {
    const isAlreadySaved = savedArticleIds.includes(id);

    // Optimistically update saved articles
    setSavedArticleIds((prev) =>
      isAlreadySaved ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
    // remove from savedArticles
    setSavedArticles((prev) =>
      isAlreadySaved
        ? prev.filter((article) => article.article_id._id !== id)
        : [...prev]
    );

    try {
      const res = await saveArticle(id);
      if (!res.success) {
        // Revert on failure
        setSavedArticleIds((prev) =>
          isAlreadySaved ? [...prev, id] : prev.filter((aid) => aid !== id)
        );
        toast.error(res.error || "Failed to save article");
      } else {
        toast.success(isAlreadySaved ? "Article Unsaved!" : "Article Saved!");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to update save status");
    }
  };

  const handleShareArticle = async (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Check out this article by ${article.creator}`,
        url: `/article?id=${article._id}`,
      });
    } else {
      const shareText = `${article.title} by ${article.creator} - /article?id=${article._id}`;
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Link copied!",
        description: "Article link copied to clipboard",
      });
    }
    const res = await shareArticle(article._id);
    if (res.success) {
      toast.success("Article Shared!");
    }
  };

  // Centralized Fetching Functions
  const fetchSavedArticles = async () => {
    setLoading(true);
    try {
      const res = await getSavedArticles();
      if (res.success) {
        setSavedArticles(res.data.savedArticles);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };
  const fetchRecommendations = async () => {
    try {
      const result = await getRecommendations();
      if (result.success && result.recommendations.length > 0) {
        setRecommendations(result.recommendations || []);
        return { success: true };
      } else if (result.needsPreferences) {
        // User needs to set preferences - don't show error toast, let the calling component handle it
        toast.error("Please set your preferences to get recommendations.");
        console.warn("User needs to set preferences:", result);
        // setRecommendations([]);
        // navigate("/preferences", { state: { fromReset: true } });
        return {
          success: false,
          needsPreferences: true,
          interestCount: result.interestCount,
        };
      } else {
        setRecommendations([]);
        console.error("No recommendations found or error:", result);
        toast.error(result.error || "Failed to fetch recommendations");

        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error in fetchRecommendations:", error);
      toast.error("Failed to fetch recommendations");
      return { success: false, error: error.message };
    }
  };

  const handleRefresh = async () => {
    const loadingId = toast.loading("Refreshing recommendations...");
    try {
      const refreshed = await refreshRecommendations();
      if (!refreshed.success) {
        toast.dismiss(loadingId);

        if (refreshed.needsPreferences) {
          // User needs to set preferences
          return {
            success: false,
            needsPreferences: true,
            message: refreshed.message,
          };
        }

        toast.error(refreshed.error || "Failed to refresh.");
        return { success: false, error: refreshed.error };
      }

      const recommendationsResult = await fetchRecommendations();
      if (recommendationsResult.needsPreferences) {
        toast.dismiss(loadingId);
        return {
          success: false,
          needsPreferences: true,
          interestCount: recommendationsResult.interestCount,
        };
      }

      toast.success("Recommendations refreshed!");
      return { success: true };
    } catch (err) {
      toast.error("Something went wrong!");
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      toast.dismiss(loadingId);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const refreshed = await markRecommendationAsRead(id);
      if (!refreshed.success) {
        console.error(refreshed.error || "Failed to mark as read.");
        return;
      }
    } catch (err) {
      console.error("Something went wrong!");
      console.error(err);
    }
  };

  const fetchLatestTrendingArticles = async () => {
    try {
      const response = await getLatestTrendingArticles();
      if (response.success) {
        console.log("Latest trending articles:", response.data);
        setTrendingArticles(response.data.articles); // change this
      }
    } catch (error) {
      console.error("Error fetching latest trending articles:", error);
    }
  };
  const fetchLatestArticles = async () => {
    try {
      const response = await getLatestArticles();
      if (response.success) {
        console.log("Latest articles:", response.data);
        setLatestArticles(response.data.articles); // change this
      }
    } catch (error) {
      console.error("Error fetching latest articles:", error);
    }
  };

  const fetchArticlesByKeyword = async (searchQuery) => {
    const loadingId = toast.loading(`Fetching results for "${searchQuery}"`);
    try {
      console.log("Fetching articles by keyword...,", searchQuery);
      const response = await getArticleByKeyword(searchQuery);
      if (response.success) {
        console.log("Articles by keyword : ", response.data.articles);
        setFilteredArticles(response.data.articles || []); // change this
      } else {
        setFilteredArticles([]);
      }
    } catch (error) {
      console.error("Error fetching articles by keyword : ", error);
    } finally {
      toast.dismiss(loadingId);
    }
  };

  const fetchLikedArticleIds = async () => {
    try {
      const response = await getLikedArticleIds();
      if (response.success) {
        console.log("Liked article ids:", response);
        setLikedArticleIds(response.data);
      }
    } catch (error) {
      console.error("Error fetching liked article ids:", error);
    }
  };

  const fetchDislikedArticleIds = async () => {
    try {
      const response = await getDislikedArticleIds();
      if (response.success) {
        console.log("Disliked article ids:", response);
        setDislikedArticleIds(response.data);
      }
    } catch (error) {
      console.error("Error fetching disliked article ids:", error);
    }
  };

  const fetchSavedArticleIds = async () => {
    try {
      const response = await getSavedArticleIds();
      if (response.success) {
        console.log("Saved article response:", response);
        setSavedArticleIds(response.data);
      }
    } catch (error) {
      console.error("Error fetching saved article ids:", error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await getRecentActivity();
      if (response.success) {
        console.log("Recent activity:", response.data);
        setRecentActivity(response.data.data || []);
      } else {
        setRecentActivity([]);
        console.error("Failed to fetch recent activity:", response.error);
      }
    } catch (error) {
      setRecentActivity([]);
      console.error("Error fetching recent activity:", error);
    }
  };

  const handleToggleTheme = async () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    if (user) {
      await toggleTheme(newTheme, setLogin);
    }
    setIsDarkMode(newTheme === "dark");
  };

  useEffect(() => {
    if (user) {
      fetchLikedArticleIds();
      fetchDislikedArticleIds();
      fetchSavedArticleIds();
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        latestArticles,
        recentActivity,
        trendingArticles,
        searchResults,
        savedArticles,
        recommendations,
        setRecommendations,
        filteredArticles,
        setFilteredArticles,
        likedArticleIds,
        setLikedArticleIds,
        dislikedArticleIds,
        setDislikedArticleIds,
        savedArticleIds,
        handleLike,
        handleDislike,
        handleSave,
        handleShareArticle,
        setSavedArticleIds,
        fetchRecommendations,
        handleRefresh,
        fetchSavedArticles,
        fetchLatestArticles,
        fetchLatestTrendingArticles,
        fetchArticlesByKeyword,
        fetchLikedArticleIds,
        fetchDislikedArticleIds,
        fetchSavedArticleIds,
        fetchRecentActivity,
        loading,
        error,
        streak,
        currentTheme,
        setCurrentTheme,
        isDarkMode,
        handleToggleTheme,
        setIsDarkMode,
        handleMarkAsRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
