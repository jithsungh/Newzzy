import { Heart, ThumbsDown, Bookmark, Share } from "lucide-react";
import React from "react";

const Activity = ({ activity }) => {
  const dateTime = new Date(activity.timestamp);

  // Format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) {
      return `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`;
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    } else if (diffHr < 24) {
      return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="p-3 bg-base-100 rounded-lg">
      <div className="flex items-center justify-between">
        <p className="flex gap-2 text-sm font-medium text-primary capitalize">
          {activity.action === "like" && <Heart className="text-red-600 fill-red-500"  />}
          {activity.action === "dislike" && <ThumbsDown className="text-gray-600 fill-gray-500" />}
          {activity.action === "save" && <Bookmark className="text-blue-600 fill-blue-500" />}
          {activity.action === "share" && <Share className="text-green-500" />}
          {activity.action}d an article
        </p>
        <p className="text-xs text-secondary">{getTimeAgo(activity.updatedAt)}</p>
      </div>
    </div>
  );
};

export default Activity;
