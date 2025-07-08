// src/auth/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const setLogin = (userData, AccessToken) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("AccessToken", AccessToken);
  };

  const setLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("AccessToken");
  };

  // Listen for auth logout events from axios interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setLogout();
    };

    window.addEventListener("auth-logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth-logout", handleAuthLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setLogin, setLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
