import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import "./pages.css";
import Navbar from "../components/Navbar";
import Request from "../composables/Request";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  // Animation variants (unchanged)
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const lottieVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 0.8,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Check password match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Send only necessary fields to the API (exclude confirmPassword)
      const { confirmPassword, ...submitData } = form;
      await Request.post("/api/auth/register", submitData);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Signup failed.");
    }
  };

  // Generic input change handler
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <>
      <div className="signup-page-container">
        <motion.div
          className="signup-form-section"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="signup-card">
            <motion.h2 variants={itemVariants}>Create Account</motion.h2>

            <form onSubmit={handleSignup}>
              <motion.div className="signup-input-group" variants={itemVariants}>
                <label htmlFor="username">Name</label>
                <motion.input
                  type="text"
                  id="username"
                  placeholder="Your Name"
                  value={form.username}
                  onChange={handleChange}
                  required
                  whileFocus={{
                    borderColor: "#00f5ff",
                    boxShadow: "0 0 0 3px rgba(0, 245, 255, 0.2)",
                  }}
                />
              </motion.div>

              <motion.div className="signup-input-group" variants={itemVariants}>
                <label htmlFor="email">Email</label>
                <motion.input
                  type="email"
                  id="email"
                  placeholder="your@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  whileFocus={{
                    borderColor: "#00f5ff",
                    boxShadow: "0 0 0 3px rgba(0, 245, 255, 0.2)",
                  }}
                />
              </motion.div>

              <motion.div className="signup-input-group" variants={itemVariants}>
                <label htmlFor="password">Password</label>
                <motion.input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  whileFocus={{
                    borderColor: "#00f5ff",
                    boxShadow: "0 0 0 3px rgba(0, 245, 255, 0.2)",
                  }}
                />
              </motion.div>

              <motion.div className="signup-input-group" variants={itemVariants}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <motion.input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  whileFocus={{
                    borderColor: "#00f5ff",
                    boxShadow: "0 0 0 3px rgba(0, 245, 255, 0.2)",
                  }}
                />
                {error && <div className="text-red-500">{error}</div>}
              </motion.div>

              <motion.button
                type="submit"
                className="signup-button"
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 6px 20px rgba(0, 245, 255, 0.4)",
                }}
                whileTap={{
                  scale: 0.98,
                  boxShadow: "0 2px 10px rgba(0, 245, 255, 0.2)",
                }}
              >
                Signup
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="login-link">
              Already signed up? <a href="/login">Login</a>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="signup-lottie-section"
          variants={lottieVariants}
          initial="hidden"
          animate="visible"
        >
          <Player
            src="./src/assets/signup2.json"
            className="signup-lottie-player"
            loop
            autoplay
            speed={0.8}
          />
        </motion.div>
      </div>
    </>
  );
}

export default Signup;