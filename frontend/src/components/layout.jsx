// src/components/Layout.jsx
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen bg-base-100 text-primary">
      <Navbar />
      <main className="p-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
