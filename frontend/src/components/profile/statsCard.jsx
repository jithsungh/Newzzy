import React from "react";
import { Heart , Bookmark , Flame} from "lucide-react";
import useDataContext from "../../hooks/useDataContext";

const StatsCard = () => {
  const { streak,likedArticleIds, savedArticleIds} = useDataContext();
  
    // getliked articles
    // get saved articles
  return (
    <div className="rounded-lg border bg-neutral shadow-sm mb-6">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Your Stats
        </h3>
      </div>
      <div className="p-6 pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="text-red-500" />
              <span className="text-secondary ">Liked Articles</span>
            </div>
            <span className="font-semibold text-secondary">
              {likedArticleIds.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bookmark className="text-blue-500" />
              <span className="text-secondary ">Saved Articles</span>
            </div>
            <span className="font-semibold text-secondary">
              {savedArticleIds.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Flame className="text-orange-500 fill-current" />
              <span className="text-secondary ">Reading Streak</span>
            </div>
            <span className="font-semibold text-secondary">{streak} days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
