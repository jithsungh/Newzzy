// Full UI-only version of ArticleModal with dark mode and theme support

import React, { useEffect, useRef } from "react";
import {
  X,
  Heart,
  Bookmark,
  Share,
  ThumbsDown,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Calendar,
  User,
  Globe,
  HeartHandshake,
} from "lucide-react";

import useDataContext from "../hooks/useDataContext";

const Dialog = ({ open, children }) => (open ? <div>{children}</div> : null);
const Badge = ({ children, className }) => (
  <span
    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </span>
);
const Button = ({ children, className, onClick, disabled }) => (
  <button
    className={`px-3 py-1 border rounded transition ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);
const dateFormat = (dateString) => {
  const d = new Date(dateString);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("default", { month: "long" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const ArticlePopup = ({
  isOpen,
  onClose,
  article,
  onPrev,
  onNext,
  isRecommendation,
}) => {
  // add it here
  if (!article) return null;
  const popupRef = useRef(null);

  const {
    handleDislike,
    handleLike,
    handleSave,
    handleShareArticle,
    likedArticleIds,
    dislikedArticleIds,
    savedArticleIds,
    handleMarkAsRead,
  } = useDataContext();
  const isLiked = likedArticleIds.includes(article._id);
  const isDisliked = dislikedArticleIds.includes(article._id);
  const isSaved = savedArticleIds.includes(article._id);

  const image_url =
    article.image_url ||
    "https://res.cloudinary.com/dp1acglry/image/upload/v1750067412/news-1172463_1280_djpiev.jpg";

  useEffect(() => {
    if (isRecommendation) {
      handleMarkAsRead(article._id);
    }
  }, []);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (onPrev) onPrev();
          break;
        case "ArrowRight":
          event.preventDefault();
          if (onNext) onNext();
          break;
        case "1":
          event.preventDefault();
          if (handleLike) handleLike(article);
          break;
        case "2":
          event.preventDefault();
          if (handleDislike) handleDislike(article);
          break;
        case "3":
          event.preventDefault();
          if (handleSave) handleSave(article._id);
          break;
        case "4":
          event.preventDefault();
          if (handleShareArticle) handleShareArticle(article);
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onPrev, onNext, onClose]);

  return (
    <Dialog open={isOpen}>
      <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
        <div
          ref={popupRef}
          className="relative bg-base-100 text-primary rounded-lg shadow-xl w-[90vw] max-w-5xl h-[90vh] md:h-[600px] flex flex-col md:flex-row overflow-auto md:overflow-hidden border border-neutral"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-4 z-10 bg-base-100 p-1.5 rounded-full hover:bg-error/10 shadow"
            title="Close"
          >
            <X size={20} />
          </button>
          {/* Left Panel */}
          <div className="w-full md:w-1/2 h-full flex flex-col">
            <img
              src={image_url}
              alt={article.title}
              className="object-cover h-56 w-full"
              loading="eager"
            />
            <div className="flex-1 flex flex-col px-6 pt-4 pb-2 min-h-0">
              <div className="font-bold text-2xl mb-1">{article.title}</div>
              <div className="text-xs text-secondary mb-3">
                By {article.creator} · {dateFormat(article.pubDate)}
              </div>
              <div className="flex-1 overflow-y-auto rounded bg-neutral text-primary px-2 py-2 mb-2 border">
                {article.description}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-1/2 h-full flex flex-col bg-neutral text-primary relative">
            <div className="flex-1 p-6 pt-8 overflow-y-auto">
              {/* Source Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">
                  Source Information
                </h3>
                <div className="bg-base-100 rounded-lg p-4 space-y-3 border">
                  <div className="flex items-center gap-3">
                    <img
                      src={article.source_icon}
                      alt={article.source_name}
                      className="w-8 h-8"
                      loading="eager"
                    />
                    <div>
                      <div className="font-medium text-sm">
                        {article.source_name}
                      </div>
                      <a
                        href={article.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent text-xs hover:underline"
                      >
                        <Globe size={12} /> Visit Source
                      </a>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-info text-sm font-medium hover:underline"
                    >
                      <ExternalLink size={14} /> Read Full Article
                    </a>
                  </div>
                </div>
              </div>

              {/* Article Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Article Details</h3>
                <div className="bg-base-100 rounded-lg p-4 space-y-2 border">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-secondary" />
                    <span className="font-medium">Author:</span>{" "}
                    <span>{article.creator}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-secondary" />
                    <span className="font-medium">Published:</span>{" "}
                    <span>{dateFormat(article.pubDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HeartHandshake size={14} className="text-secondary" />
                    <span className="font-medium">Liked By:</span>{" "}
                    <span>{article.likes}</span>
                    {article.likes == 0 && (
                      <span className="text-secondary">
                        Be the first to like this article
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-3">Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {isLiked ? (
                    <Button
                      onClick={() => handleLike(article)}
                      className="bg-red-500 text-white flex justify-between items-baseline gap-2 hover:opacity-90 active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2">
                        <Heart size={16} /> Liked
                      </span>
                      <span className="text-sm text-white">1</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleLike(article)}
                      className="bg-base-100 text-red-500 flex justify-between items-baseline gap-2 hover:bg-red-500 hover:text-white active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2">
                        <Heart size={16} /> Like
                      </span>
                      <span className="text-sm text-secondary">1</span>
                    </Button>
                  )}
                  {isDisliked ? (
                    <Button
                      onClick={() => handleDislike(article)}
                      className="bg-gray-500 text-white flex items-baseline justify-between gap-2 hover:opacity-90 active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2">
                        <ThumbsDown size={16} /> Disliked
                      </span>
                      <span className="text-sm text-white">2</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleDislike(article)}
                      className="bg-base-100 text-gray-500 flex justify-between items-baseline gap-2 hover:bg-gray-500 hover:text-white active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2">
                        <ThumbsDown size={16} /> Dislike
                      </span>
                      <span className="text-sm text-secondary">2</span>
                    </Button>
                  )}
                  {isSaved ? (
                    <Button
                      onClick={() => handleSave(article._id)}
                      className="bg-blue-500 text-white flex justify-between items-baseline gap-2 hover:opacity-90 active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2">
                        <Bookmark size={16} /> Saved
                      </span>
                      <span className="text-sm text-white">3</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSave(article._id)}
                      className="bg-base-100 text-blue-500 flex justify-between items-baseline gap-2 hover:bg-blue-500 hover:text-white active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2">
                        <Bookmark size={16} /> Save
                      </span>
                      <span className="text-sm text-secondary">3</span>
                    </Button>
                  )}
                  <Button
                    onClick={() => handleShareArticle(article)}
                    className="border bg-base-100 text-green-500 flex justify-between items-baseline gap-2 hover:bg-green-500 hover:text-white active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2">
                      <Share size={16} /> Share
                    </span>
                    <span className="text-sm text-secondary">4</span>
                  </Button>
                </div>
              </div>

              {/* Keywords */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword, index) => (
                    <Badge key={index} className="bg-accent/20 text-accent">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="border-t p-4 bg-base-100">
              <div className="flex justify-between gap-4">
                <Button
                  onClick={onPrev}
                  disabled={!onPrev}
                  className="flex-1 flex items-center justify-center gap-2 border hover:bg-primary hover:text-neutral active:scale-[0.98] disabled:opacity-10 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} /> Previous
                </Button>
                <Button
                  onClick={onNext}
                  disabled={!onNext}
                  className="flex-1 flex items-center justify-center gap-2 border hover:bg-primary hover:text-neutral active:scale-[0.98] disabled:opacity-10 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default React.memo(ArticlePopup);
