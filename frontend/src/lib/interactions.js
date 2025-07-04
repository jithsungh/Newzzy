

const handleLike = async (id) => {
    const isAlreadyLiked = likedArticles.includes(id);

    // Optimistically update state
    setLikedArticles((prev) =>
      isAlreadyLiked ? prev.filter((aid) => aid !== id) : [...prev, id]
    );

    // Remove from disliked if present
    if (!isAlreadyLiked) {
      setDislikedArticles((prev) => prev.filter((aid) => aid !== id));
    }

    try {
      const res = await likeArticle(id);
      if (!res.success) {
        // Revert changes on failure
        setLikedArticles((prev) =>
          isAlreadyLiked ? [...prev, id] : prev.filter((aid) => aid !== id)
        );
        toast.error(res.error || "Failed to update like status");
      } else {
        toast.success(isAlreadyLiked ? "Article Unliked!" : "Article Liked!");
        // Refresh liked articles to ensure sync with server
        await fetchLikedArticles();
      }
    } catch (error) {
      console.error("Error liking article:", error);
      toast.error("Failed to update like status");
    }
  };
  const handleDislike = async (id) => {
    const isAlreadyDisliked = dislikedArticles.includes(id);

    setDislikedArticles((prev) =>
      isAlreadyDisliked ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
    setLikedArticles((prev) => prev.filter((aid) => aid !== id));

    const res = await dislikeArticle(id);
    if (!res.success) {
      setDislikedArticles((prev) =>
        isAlreadyDisliked ? [...prev, id] : prev.filter((aid) => aid !== id)
      );
      toast.error(res.error || "Failed to dislike article");
    } else {
      toast.success(
        isAlreadyDisliked ? "Article Undisliked!" : "Article Disliked!"
      );
    }
  };

  const handleSave = async (id) => {
    const isAlreadySaved = savedArticles.includes(id);

    setSavedArticles((prev) =>
      isAlreadySaved ? prev.filter((aid) => aid !== id) : [...prev, id]
    );

    const res = await saveArticle(id);
    if (!res.success) {
      setSavedArticles((prev) =>
        isAlreadySaved ? [...prev, id] : prev.filter((aid) => aid !== id)
      );
      toast.error(res.error || "Failed to save article");
    } else {
      toast.success(isAlreadySaved ? "Article Unsaved!" : "Article Saved!");
    }
  };

  const handleShare = async (id) => {
    const res = await shareArticle(id);
    if (!res.success) {
      toast.error(res.error || "Failed to share article");
    } else {
      toast.success("Article Shared!");
    }
  };