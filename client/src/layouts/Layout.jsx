import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import LoaderOverlay from "../components/LoaderOverlay";

const Layout = () => {
  return (
    <>
      <LoaderOverlay />  {/* Loader will track route changes */}
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
