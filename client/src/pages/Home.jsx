import React from "react";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import { useNavigate } from "react-router-dom"; // 🟢 Import useNavigate
import backgroundLottie from "../assets/background.json";

function Home() {
  const navigate = useNavigate(); // 🟢 Initialize navigate

  const handleGetStarted = () => {
    if (JSON.parse(localStorage.getItem("auth-storage")).state.token) {
      console.log("User authenticated, navigating to Whiteboard.");
      window.location.href = import.meta.env.VITE_WHITEBOARD; // 🟢 Navigate to Whiteboard Page
    } else {
      console.log("User not authenticated, redirecting to login.");
      navigate("/login"); // 🟢 Navigate to Login Page
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div className="lottie-background-container">
        <Player
          src={backgroundLottie}
          loop
          autoplay
          className="lottie-background-player"
        />
        <div className="overlay-content">
          <h1>Welcome to Dhongorsho!</h1>
          <p>Explore our animated world.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted} // 🟢 Handle button click
            style={{
              padding: "12px 25px",
              fontSize: "18px",
              backgroundColor: "#00f5ff",
              color: "#0a0f24",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "20px",
              boxShadow: "0 4px 15px rgba(0, 245, 255, 0.3)",
            }}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default Home;
