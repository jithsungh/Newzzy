import { Heart, ThumbsDown, Bookmark, Share } from "lucide-react";
import {
  Heart as HeartFilled,
  ThumbsDown as ThumbsDownFilled,
  Bookmark as BookmarkFilled,
} from "lucide-react";
import useDataContext from "../hooks/useDataContext"; 

import toast from "react-hot-toast";


const ArticleCard = ({
  article,
  onClick,
}) => {
  const { handleLike, handleDislike, handleSave,handleShareArticle,likedArticleIds,dislikedArticleIds,savedArticleIds } = useDataContext();
  const isLiked = likedArticleIds.includes(article._id);
  const isDisliked = dislikedArticleIds.includes(article._id);
  const isSaved = savedArticleIds.includes(article._id);

  const image_url =
    article.image_url ||
    "https://res.cloudinary.com/dp1acglry/image/upload/v1750067412/news-1172463_1280_djpiev.jpg";

  const dateFormat = (dateString) => {
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("default", { month: "long" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="rounded-lg overflow-hidden bg-card border cursor-pointer flex flex-col shadow hover:shadow-lg transition-shadow group">
      <img
        onClick={() => onClick(article)}
        src={image_url}
        alt="article"
        className="object-cover w-full h-full max-h-[280px] min-h-[200px] group-hover:scale-105 transition-transform duration-300"
      />
      <div className="p-4">
        <div className="font-semibold text-lg leading-tight mb-1 line-clamp-2 text-primary">
          {article.title}
        </div>
        <div className="text-sm text-muted-foreground mb-2 text-secondary flex gap-1.5">
          <div>By</div>
          <div className="font-medium">{article.source_name}</div>
          <div>on {dateFormat(article.pubDate)}</div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          {isLiked ? (
            <HeartFilled
              className="text-red-500 fill-red-500 cursor-pointer"
              onClick={() => handleLike(article._id)}
            />
          ) : (
            <Heart
              className="text-red-500 cursor-pointer hover:text-red-700 transition-colors"
              onClick={() => handleLike(article._id)}
            />
          )}

          {isDisliked ? (
            <ThumbsDownFilled
              className="text-gray-500 fill-gray-500 cursor-pointer"
              onClick={() => handleDislike(article._id)}
            />
          ) : (
            <ThumbsDown
              className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => handleDislike(article._id)}
            />
          )}

          {isSaved ? (
            <BookmarkFilled
              className="text-blue-500 fill-blue-500 cursor-pointer"
              onClick={() => handleSave(article._id)}
            />
          ) : (
            <Bookmark
              className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
              onClick={() => handleSave(article._id)}
            />
          )}

          <Share
            className="text-green-500 cursor-pointer hover:text-green-700 transition-colors"
            onClick={() => handleShareArticle(article)}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
