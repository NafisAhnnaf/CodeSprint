import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import "./components.css";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth"; // Zustand Auth Store

function Navbar() {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const token = useAuth((state) => state.token); // 🔥 Reactive token state
  const isHydrated = useAuth((state) => state.isHydrated);
  const navigate = useNavigate();

  const isLoggedIn = !!token; // Convert token to boolean

  if (!isHydrated) return null; // Optional: Avoid flicker

  const navItemsLeft = [
    { name: "Home", icon: "🏠" },
    { name: "About", icon: "ℹ️" },
    { name: "Contact", icon: "📞" },
  ];

  const handleSearchClick = () => setShowSearchBar(true);
  const handleCloseSearchBar = () => setShowSearchBar(false);

  const searchBarVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.8,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          {navItemsLeft.map((item, index) => (
            <Link
              key={index}
              to={item.name === "Home" ? "/" : `/${item.name.toLowerCase()}`}
            >
              <motion.div className="nav-item" whileHover={{ scale: 1.1 }}>
                {item.name}
                <motion.span
                  className="nav-icon"
                  initial={{ opacity: 0, y: -10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.icon}
                </motion.span>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="nav-center">
          <Link to={"/"}>
            <h1>Dhongorsho</h1>
          </Link>
        </div>

        <div className="nav-right">
          <motion.div
            className="nav-item"
            whileHover={{ scale: 1.1 }}
            onClick={handleSearchClick}
            style={{ cursor: "pointer" }}
          >
            Search
            <motion.span
              className="nav-icon"
              initial={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              🔍
            </motion.span>
          </motion.div>

          {isLoggedIn ? (
            <Link to="/profile">
              <motion.div
                className="nav-item"
                whileHover={{ scale: 1.1 }}
                style={{ cursor: "pointer" }}
              >
                Profile
                <motion.span
                  className="nav-icon"
                  initial={{ opacity: 0, y: -10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  👤
                </motion.span>
              </motion.div>
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <motion.div className="nav-item" whileHover={{ scale: 1.1 }}>
                  Login
                  <motion.span
                    className="nav-icon"
                    initial={{ opacity: 0, y: -10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    🔑
                  </motion.span>
                </motion.div>
              </Link>
              <Link to="/signup" className="nav-link">
                <motion.div className="nav-item" whileHover={{ scale: 1.1 }}>
                  Signup
                  <motion.span
                    className="nav-icon"
                    initial={{ opacity: 0, y: -10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    📝
                  </motion.span>
                </motion.div>
              </Link>
            </>
          )}
        </div>

        <Player
          src="./src/assets/top.json"
          className="nav-lottie"
          loop
          autoplay
        />
      </nav>

      <AnimatePresence>
        {showSearchBar && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseSearchBar}
          >
            <motion.div
              className="search-bar-content"
              variants={searchBarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <input type="text" placeholder="Search..." />
              <button onClick={handleCloseSearchBar}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
