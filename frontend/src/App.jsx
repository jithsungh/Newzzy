import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

// Import pages
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import ForgotPasswordPage from "./pages/forgotPassword";
import HomePage from "./pages/home";
import ExplorePage from "./pages/explore";
import ProfilePage from "./pages/profile";
import IndexPage from "./pages/index";
import NotFound from "./pages/notFound";
import SavedArticlesPage from "./pages/savedArticles";
import Article from "./pages/article";
import Search from "./pages/search";
import { useAuth } from "./context/authContext";
import ProtectedRoute from "./context/protectedRoutes";
import Layout from "./components/layout";
import UserPreferences from "./pages/userpreferences";

import useDataContext from "./hooks/useDataContext";

function App() {
  // const { user } = useAuth();
  const { currentTheme } = useDataContext();
  let theme = currentTheme || "light"; // Default to 'newslight' if no user or theme set
  theme = `news${theme}`; // Prefix 'news' to the theme

  return (
    <div data-theme={theme} className="App">
      {/* Add a theme toggle button somewhere visible */}
      {/* You can move this into Navbar/Layout for better UX */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/" element={<IndexPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedArticlesPage />
              </ProtectedRoute>
            }
          />
          <Route path="/article" element={<Article />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="/preferences"
          element={
            <ProtectedRoute>
              <UserPreferences />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
