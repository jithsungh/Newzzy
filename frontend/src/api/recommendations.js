import api from "./axios";
import { toast } from "react-hot-toast";

const getRecommendations = async () => {
  try {
    const response = await api.get("/recommendations/get");
    if (response.status === 200) {
      // Only show success toast if we actually have recommendations
      if (
        response.data.recommendations &&
        response.data.recommendations.length > 0
      ) {
        toast.success("Recommendations fetched successfully!");
      }
      const { AccessToken } = response.data;

      localStorage.setItem("AccessToken", AccessToken);
      const recommendations = response.data.recommendations.map((rec) => ({
        _id: rec._id,
        score: rec.score,
        status: rec.status,
        ...rec.article_id, // Spread the nested article properties
      }));
      return { success: true, recommendations };
    }
    return {
      success: false,
      error: response.data.error || "Failed to fetch recommendations",
    };
  } catch (error) {
    console.error("Error fetching recommendations:", error);

    // Handle insufficient interests case (403 or 404 status)
    if (error.response?.status === 403 || error.response?.status === 404) {
      // Don't show error toast for this case, it will be handled by the calling component
      return {
        success: false,
        needsPreferences: true,
        error: error.response.data.error || "User needs to set preferences",
        message:
          error.response.data.message ||
          "Please set your interests to get personalized recommendations",
        interestCount: error.response.data.interestCount || 0,
      };
    }

    return {
      success: false,
      error: error.response?.data?.error || "An unexpected error occurred",
    };
  }
};

const refreshRecommendations = async () => {
  try {
    const response = await api.post("/recommendations/refresh");
    if (response.status === 200) {
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.data.error || "Failed to refresh recommendations",
    };
  } catch (error) {
    console.error("Error refreshing recommendations:", error);

    // Handle insufficient interests case
    if (
      error.response?.status === 403 &&
      error.response?.data?.needsPreferences
    ) {
      return {
        success: false,
        needsPreferences: true,
        error: error.response.data.error || "User needs to set preferences",
        message:
          error.response.data.message ||
          "Please set your interests to get personalized recommendations",
      };
    }

    return {
      success: false,
      error: error.response?.data?.error || "An unexpected error occurred",
    };
  }
};

const deleteOldRecommendations = async () => {
  try {
    const response = await api.get("/recommendations/delete");
    if (response.status === 200) {
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.data.error || "Failed to delete old recommendations",
    };
  } catch (error) {
    console.error("Error deleting old recommendations:", error);
    return {
      success: false,
      error: error.response?.data?.error || "An unexpected error occurred",
    };
  }
};

const markRecommendationAsRead = async (articleId) => {
  try {
    const response = await api.post("/recommendations/markasread", {
      articleId,
    });
    if (response.status === 200) {
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.data.error || "Failed to mark recommendation as read",
    };
  } catch (error) {
    console.error("Error marking recommendation as read:", error);
    return {
      success: false,
      error: error.response?.data?.error || "An unexpected error occurred",
    };
  }
};

export {
  getRecommendations,
  refreshRecommendations,
  deleteOldRecommendations,
  markRecommendationAsRead,
};
// This module provides functions to interact with the recommendations API.
// It includes methods to get, refresh, delete old recommendations, and mark a recommendation as read.
// Each function handles API requests and responses, managing access tokens and errors appropriately.
// The functions return a standardized response format indicating success or failure.
// The API endpoints are assumed to be defined in the backend and are accessed via the axios instance `api`.
// The functions handle errors gracefully, logging them to the console and returning user-friendly error messages.
