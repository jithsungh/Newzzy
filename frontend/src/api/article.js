import api from "./axios";

const getArticleById = async (article_id) => {
  try {
    const response = await api.get("/articles/getarticlebyid", {
      params: { article_id },
    });
    if (response.status === 200) {
      console.log(response.data);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Article error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Article fetch failed",
    };
  }
};

const getLatestArticles = async () => {
  try {
    const response = await api.get("/articles/getlatestarticles");
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Latest articles error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Latest articles fetch failed",
    };
  }
};


const getLatestTrendingArticles = async () => {
  try {
    const response = await api.get("/articles/getlatesttrendingarticles");
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Trending articles error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Trending articles fetch failed",
    };
  }
  
};

const getArticleByKeyword = async (keyword) => {
  try {
    console.log(keyword);
    const response = await api.get("/articles/getarticlebykeyword", {
      params: { keyword },
    });
    console.log(response.data);
    if (response.status === 200) {
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) { 
    console.error("getArticleByKeyword error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "getArticleByKeyword fetch failed",
      
    };
  }
};

const getArticleByCategory = async (category) => {
  try {
    const response = await api.get("/articles/getarticlebycategory", {
      category,
    });
    if (response.status === 200) {
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Article by category error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message || "Article by category fetch failed",
    };
  }
};

const getSavedArticles = async () => {
  try {
    const response = await api.get("/articles/getsavedarticles");
    if (response.status === 200) {
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Saved articles error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Saved articles fetch failed",
    };
  }
};

const getLikedArticles = async () => {
  try {
    const response = await api.get("/articles/getlikedarticles");
    if (response.status === 200) {
      const { AccessToken, likedArticles } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      // Return the array of liked article IDs
      return {
        success: true,
        data: response.data.likedArticles || [], // Change this line
      };
    }
    return {
      success: false,
      error: response.data.error,
    };
  } catch (error) {
    console.error("Liked articles error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch liked articles",
    };
  }
};

const getDislikedArticles = async () => {
  try {
    const response = await api.get("/articles/getdislikedarticles");
    if (response.status === 200) {
      const { AccessToken, dislikedArticles } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return {
        success: true,
        dislikedArticles: dislikedArticles || [],
      };
    }
    return {
      success: false,
      error: response.data.error,
    };
  } catch (error) {
    console.error("Disliked articles error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch disliked articles",
    };
  }
};

const likeArticle = async (article_id) => {
  try {
    const response = await api.post("/userinteractions/like", { article_id });
    if (response.status === 200) {
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Like article error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Like article failed",
    };
  }
};

const dislikeArticle = async (article_id) => {
  try {
    const response = await api.post("/userinteractions/dislike", {
      article_id,
    });
    if (response.status === 200) {
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Dislike article error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Dislike article failed",
    };
  }
};

const saveArticle = async (article_id) => {
  try {
    const response = await api.post("/userinteractions/save", { article_id });
    if (response.status === 200) {
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Save article error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Save article failed",
    };
  }
};

const shareArticle = async (article_id) => {
  try {
    const response = await api.post("/userinteractions/share", { article_id });
    if (response.status === 200) {
      const { AccessToken } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Share article error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Share article failed",
    };
  }
};

const getLikedArticleIds = async () => {
  try {
    const response = await api.get("/articles/getlikedarticleids");
    if (response.status === 200) {
      const { AccessToken, likedArticleIds } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return {
        success: true,
        data: response.data.likedArticleIds,
      };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Liked articles error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch liked articles",
    };
  }
}

const getDislikedArticleIds = async () => {
  try {
    const response = await api.get("/articles/getdislikedarticleids");
    if (response.status === 200) {
      const { AccessToken, dislikedArticleIds } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return {
        success: true,
        data: response.data.dislikedArticleIds,
      };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Disliked articles error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch disliked articles",
    };
  }
}

const getSavedArticleIds = async () => {
  try {
    const response = await api.get("/articles/getsavedarticleids");
    if (response.status === 200) {
      const { AccessToken, savedArticleIds } = response.data;
      localStorage.setItem("AccessToken", AccessToken);
      return {
        success: true,
        data: response.data.savedArticleIds,
      };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Saved articles error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch saved articles",

    };
  }
}

export {
  getArticleById,
  getLatestArticles,
  getLatestTrendingArticles,
  getArticleByKeyword,
  getArticleByCategory,
  getSavedArticles,
  getLikedArticles,
  getDislikedArticles,
  likeArticle,
  dislikeArticle,
  saveArticle,
  shareArticle,
  getLikedArticleIds,
  getDislikedArticleIds,
  getSavedArticleIds

};
