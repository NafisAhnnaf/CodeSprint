import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const Layout = () => {
  return (
    <>
      <Navbar />
      <ToastContainer position="top-center" autoClose={2500} />
      <main className="p-4">
        <Outlet />
      </main>

      <Footer />
    </>
  );
};

export default Layout;
