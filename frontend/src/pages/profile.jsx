import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import ProfileCard from "../components/profile/ProfileCard.jsx";
import StatsCard from "../components/profile/StatsCard.jsx";
import ActionCard from "../components/profile/ActionCard.jsx";
import ArticleCard from "../components/ArticleCard";
import ArticlePopup from "../components/ArticlePopup";
import Activity from "../components/profile/Activity.jsx";

import { Heart, Bookmark } from "lucide-react";
import { LogOut } from "lucide-react";

import useDataContext from "../hooks/useDataContext";

const ProfilePage = () => {
  const { user, setLogout } = useAuth();
  const [activeTab, setActiveTab] = useState("SavedArticlesTab");
  const {
    savedArticles,
    fetchSavedArticles,
    fetchRecentActivity,
    recentActivity,
  } = useDataContext();

  React.useEffect(() => {
    fetchSavedArticles();
  }, []);

  React.useEffect(() => {
    if (activeTab === "ActivityTab") {
      fetchRecentActivity();
    }
  }, [activeTab]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleLogout = () => {
    setLogout();
  };

  const [isOpen, setIsOpen] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(null);

  const handlePopupOpen = (index) => {
    setCurrentArticleIndex(index);
    console.log(savedArticles[index].article_id);
    setIsOpen(true);
  };

  const handlePopupClose = () => {
    setIsOpen(false);
    setCurrentArticleIndex(null);
  };

  const handlePopupNext = () => {
    if (currentArticleIndex < savedArticles.length - 1) {
      setCurrentArticleIndex((prev) => prev + 1);
    }
  };

  const handlePopupPrev = () => {
    if (currentArticleIndex > 0) {
      setCurrentArticleIndex((prev) => prev - 1);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm-px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Profile</h1>
            <p className="text-secondary mt-1">
              Manage your account and saved articles
            </p>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="justify-center gap-2 whitespace-nowrap bg-neutral text-primary rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:ring-2 outline-none focus-visible:ring-ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-primary hover:text-neutral hover:text-accent-foreground h-10 px-4 py-2 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ProfileCard user={user} />
            <StatsCard />
            <ActionCard />
          </div>
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="h-10 items-center justify-center rounded-md bg-gray-200 py-0.5 px-1 grid w-full grid-cols-2">
                <button
                  onClick={() => handleTabClick("SavedArticlesTab")}
                  className={`border rounded-tl-md rounded-bl-md inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
                  ${
                    activeTab === "SavedArticlesTab"
                      ? "bg-[#0F172A] text-white"
                      : "bg-white text-[#0F172A]"
                  }`}
                >
                  Saved Articles
                </button>

                <button
                  onClick={() => handleTabClick("ActivityTab")}
                  className={`border rounded-tr-md rounded-br-md inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
                  ${
                    activeTab === "ActivityTab"
                      ? "bg-[#0F172A] text-white"
                      : "bg-white text-[#0F172A]"
                  }`}
                >
                  Activity
                </button>
              </div>
              {activeTab === "SavedArticlesTab" && (
                <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-6">
                  <div className="rounded-lg border bg-neutral shadow-sm">
                    <div className="p-6 flex flex-col items-center justify-center py-12">
                      {savedArticles.length === 0 ? (
                        <div className="p-6 flex flex-col items-center justify-center py-12">
                          <Bookmark className="w-10 h-10 text-secondary" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-400 mb-2">
                            No saved articles yet
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-center">
                            Start saving articles you want to read later by
                            clicking the save button on any article.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                          {savedArticles.map((article, index) => (
                            <ArticleCard
                              key={article._id}
                              article={article.article_id}
                              onClick={() => handlePopupOpen(index)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "ActivityTab" && (
                <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-6">
                  <div className="rounded-lg border bg-neutral shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6">
                      <h3 className="text-2xl font-semibold leading-none tracking-tight">
                        Recent Activity
                      </h3>
                    </div>
                    <div className="p-6 pt-0">
                      <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                          <div className="p-6 flex flex-col items-center justify-center py-12">
                            <Heart className="w-10 h-10 text-secondary" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-400 mb-2">
                              No recent activity
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center">
                              Your recent activity will appear here.
                            </p>
                          </div>
                        ) : (
                          recentActivity.map((activity) => (
                            <Activity key={activity._id} activity={activity} />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-6"></div>
            </div>
          </div>
        </div>
      </div>
      {isOpen && currentArticleIndex !== null && (
        <ArticlePopup
          isOpen={isOpen}
          onClose={handlePopupClose}
          article={savedArticles[currentArticleIndex].article_id}
          onPrev={currentArticleIndex > 0 ? handlePopupPrev : null}
          onNext={
            currentArticleIndex < savedArticles.length - 1
              ? handlePopupNext
              : null
          }
          isRecommendation={false}
        />
      )}
    </div>
  );
};

export default ProfilePage;
