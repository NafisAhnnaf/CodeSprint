// Navbar.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import './components.css';
import { Link } from 'react-router-dom';


function Navbar() {
  const [showSearchBar, setShowSearchBar] = useState(false);

  const navItemsLeft = [
    { name: 'Home', icon: '🏠' },
    { name: 'About', icon: 'ℹ️' },
    { name: 'Contact', icon: '📞' }
  ];

  const navItemsRight = [
    { name: 'Search', icon: '🔍' },
    { name: 'Login', icon: '🔑' },
    { name: 'Signup', icon: '📝' }
  ];

  const handleSearchClick = () => {
    setShowSearchBar(true);
  };

  const handleCloseSearchBar = () => {
    setShowSearchBar(false);
  };

  // Framer Motion variants for the search bar
  const searchBarVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 50, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          {navItemsLeft.map((item, index) => (
            <Link key={index+1} to={item.name === 'Home' ? '/' : `/${item.name.toLowerCase()}`}>
            <motion.div
              key={index}
              className="nav-item"
              whileHover={{ scale: 1.1 }}
            >
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
          <h1>Dhongorsho</h1>
        </div>

        <div className="nav-right">
  {navItemsRight.map((item, index) => (
    item.name === 'Search' ? (
      // ⛔ DO NOT WRAP THIS IN <Link>
      <motion.div
        key={index}
        className="nav-item"
        whileHover={{ scale: 1.1 }}
        onClick={handleSearchClick} // Opens Search Popup
        style={{ cursor: 'pointer' }}
      >
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
    ) : (
      // ✅ Wrap Login & Signup in <Link>
      <Link
        key={index}
        to={`/${item.name.toLowerCase()}`}
        className="nav-link"
      >
        <motion.div
          className="nav-item"
          whileHover={{ scale: 1.1 }}
        >
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
    )
  ))}
</div>


        {/* Lottie animation for Navbar - ensure the path is correct in your project */}
        <Player
          src="./src/assets/top.json" // Make sure this path is correct
          className="nav-lottie"
          loop
          autoplay
        />
      </nav>

      {/* Search Bar Overlay */}
      <AnimatePresence>
        {showSearchBar && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseSearchBar} // Close when clicking outside
          >
            <motion.div
              className="search-bar-content"
              variants={searchBarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the bar
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
