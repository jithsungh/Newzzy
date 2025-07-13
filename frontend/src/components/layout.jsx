// src/components/Layout.jsx
import Navbar from "./navbar";
import ScrollToTop from "./ScrollToTop";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen bg-base-100 text-primary">
      <ScrollToTop />
      <Navbar />
      <main className="p-0 pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
