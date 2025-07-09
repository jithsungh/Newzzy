import React from "react";
import {
  Heart,
  Bookmark,
  Share,
  ThumbsDown,
  ExternalLink,
  Calendar,
  User,
  Globe,
} from "lucide-react";
import useDataContext from "../hooks/useDataContext";

const Badge = ({ children, className }) => (
  <span
    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

const Button = ({ children, className, onClick, disabled }) => (
  <button
    className={`px-4 py-2 rounded-md transition shadow-sm hover:opacity-90 active:scale-[0.98] ${className}`}
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

const ArticleViewPage = ({ article }) => {
  if (!article) return null;
  const {
    handleLike,
    handleDislike,
    handleSave,
    handleShareArticle,
    likedArticleIds,
    dislikedArticleIds,
    savedArticleIds,
  } = useDataContext();
  const isLiked = likedArticleIds.includes(article._id);
  const isDisliked = dislikedArticleIds.includes(article._id);
  const isSaved = savedArticleIds.includes(article._id);

  return (
    <div className="min-h-screen bg-base-100 text-primary px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3 space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              {article.title}
            </h1>
            <div className="text-sm text-secondary">
              By {article.creator} · {dateFormat(article.pubDate)}
            </div>
            <img
              src={article.image_url}
              alt={article.title}
              className="rounded-lg w-full h-[350px] object-cover shadow"
              loading="eager"
            />
            {/* Description */}
            <div className="bg-neutral rounded-lg p-6 text-primary text-lg leading-relaxed border shadow">
              {article.description}
            </div>
          </div>

          {/* Source Panel */}
          <div className="md:w-1/3 space-y-6 bg-neutral rounded-lg p-5 shadow border">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Source</h2>
              <div className="flex items-center gap-3">
                <img
                  src={article.source_icon}
                  alt={article.source_name}
                  className="w-10 h-10"
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
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-info text-sm font-medium hover:underline"
              >
                <ExternalLink size={14} /> Read Full Article
              </a>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {isLiked ? (
                  <Button
                    onClick={() => handleLike(article._id)}
                    className="bg-red-500 text-white flex items-center gap-2 hover:opacity-90 active:scale-[0.98]"
                  >
                    <Heart size={16} /> Liked
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleLike(article._id)}
                    className="bg-base-100 text-red-500 flex items-center gap-2 hover:bg-red-500 hover:text-white active:scale-[0.98]"
                  >
                    <Heart size={16} /> Like
                  </Button>
                )}
                {isDisliked ? (
                  <Button
                    onClick={() => handleDislike(article._id)}
                    className="bg-gray-500 text-white flex items-center gap-2 hover:opacity-90 active:scale-[0.98]"
                  >
                    <ThumbsDown size={16} /> Disliked
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleDislike(article._id)}
                    className="bg-base-100 text-gray-500 flex items-center gap-2 hover:bg-gray-500 hover:text-white active:scale-[0.98]"
                  >
                    <ThumbsDown size={16} /> Dislike
                  </Button>
                )}
                {isSaved ? (
                  <Button
                    onClick={() => handleSave(article._id)}
                    className="bg-blue-500 text-white flex items-center gap-2 hover:opacity-90 active:scale-[0.98]"
                  >
                    <Bookmark size={16} /> Saved
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSave(article._id)}
                    className="bg-base-100 text-blue-500 flex items-center gap-2 hover:bg-blue-500 hover:text-white active:scale-[0.98]"
                  >
                    <Bookmark size={16} /> Save
                  </Button>
                )}
                <Button
                  onClick={() => handleShareArticle(article)}
                  className="border bg-base-100 text-green-500 flex items-center gap-2 hover:bg-green-500 hover:text-white active:scale-[0.98]"
                >
                  <Share size={16} /> Share
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Details</h2>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-secondary" />
                  <span className="font-medium">Author:</span> {article.creator}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-secondary" />
                  <span className="font-medium">Published:</span>{" "}
                  {dateFormat(article.pubDate)}
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword, idx) => (
                  <Badge key={idx} className="bg-blue-300 text-neutral">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ArticleViewPage);
