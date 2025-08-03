// Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import "./pages.css"; // Import the new CSS file
import Navbar from "../components/Navbar";
import Request from "../composables/Request";
import { toast } from "react-toastify";

function Login() {
  // Framer Motion variants for the overall form container
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        when: "beforeChildren", // Animate parent before children
        staggerChildren: 0.1, // Stagger child animations
      },
    },
  };

  // Framer Motion variants for input fields and buttons
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Framer Motion variants for the Lottie section
  const lottieVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 0.8,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleLogin = async (e) => {
    e.preventDefault();
    if (formData.email === "" || formData.password === "") {
      toast.warning("Email or Password cannot be empty", {
        toastId: "Empty-String",
      });
      setError("Email or Password field is empty");
      return;
    }
    try {
      const res = await Request.post("/api/auth/login", formData);
      login(res.token);
      console.log(res);
      toast.success("Login Successful!", {
        toastId: "User-Authorized",
      });
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      console.log(err);
    }
  };
  const handleGoogleLogin = ()=>{
    console.log("Google login not implemented");
  }

  return (
    <>

      <div className="login-page-container">
        {/* Lottie Animation Section */}

        <motion.div
          className="login-lottie-section"
          variants={lottieVariants}
          initial="visible"
          animate="visible"
        >
          <Player
            src="./src/assets/login.json" // Replace with your login Lottie JSON path
            className="login-lottie-player"
            loop
            autoplay
            speed={0.8} // Adjust Lottie animation speed
          />
        </motion.div>

        {/* Login Form Section */}
        <motion.div
          className="login-form-section"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="login-card">
            <motion.h2 variants={itemVariants}>Welcome Back!</motion.h2>

            <form>
              <motion.div className="login-input-group" variants={itemVariants}>
                <label htmlFor="email">Email</label>
                <motion.input
                  type="email"
                  id="email"
                  placeholder="your@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value.trim() })
                  }
                  required
                  whileFocus={{
                    borderColor: "#00f5ff",
                    boxShadow: "0 0 0 3px rgba(0, 245, 255, 0.2)",
                  }}
                />
              </motion.div>

              <motion.div className="login-input-group" variants={itemVariants}>
                <label htmlFor="password">Password</label>
                <motion.input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  whileFocus={{
                    borderColor: "#00f5ff",
                    boxShadow: "0 0 0 3px rgba(0, 245, 255, 0.2)",
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="forgot-password">
                <a href="#">Forgot Password?</a>
              </motion.div>

              <motion.button
                type="submit"
                className="login-button"
                variants={itemVariants}
                onClick={handleLogin}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 6px 20px rgba(0, 245, 255, 0.4)",
                }}
                whileTap={{
                  scale: 0.98,
                  boxShadow: "0 2px 10px rgba(0, 245, 255, 0.2)",
                }}
              >
                Login
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="divider">
              OR
            </motion.div>

            <motion.button
              className="google-button"
              variants={itemVariants}
              onClick={handleGoogleLogin}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 6px 20px rgba(66, 133, 244, 0.4)",
              }}
              whileTap={{
                scale: 0.98,
                boxShadow: "0 2px 10px rgba(66, 133, 244, 0.2)",
              }}
            >
              <svg
                className="google-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="24px"
                height="24px"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,2.867,0.748,5.669,2.206,8.188L13.887,29.7C12.119,27.28,11,24.719,11,22C11,18.373,12.955,15.108,16.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.571,4.819C6.748,38.331,7,41.133,7,44C7,44,24,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.117-4.088,5.592c3.232,2.671,7.026,4.256,11.381,4.256c6.627,0,12-5.373,12-12C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Continue with Google
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

export default Login;
