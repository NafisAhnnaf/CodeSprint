import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import footerBgLottie from "../assets/footer-background.json";  // Replace with your Lottie file
// import decorLottie from "../assets/footer-decor.json";          // Decorative floating Lottie

const Footer = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <footer className="relative w-full overflow-hidden text-white py-8">
      {/* Background Lottie */}
      <Player
        src={footerBgLottie}
        className="absolute inset-0 w-full h-full object-fill opacity-45"
        loop
        autoplay
      />

      {/* Floating Decorative Lottie */}
      {/* <Player
        src={decorLottie}
        className="absolute top-2 left-4 w-32 opacity-70"
        loop
        autoplay
      />
      <Player
        src={decorLottie}
        className="absolute bottom-2 right-4 w-32 opacity-70"
        loop
        autoplay
        speed={0.8}
      /> */}

      <div className="relative z-10 text-center space-y-2">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          © 2025 <span className="text-cyan-400 font-semibold">CodeSprint</span>. All rights reserved.
        </motion.p>

        <motion.button
          whileHover={{
            scale: 1.1,
            background: "linear-gradient(90deg, #00f5ff, #0088ff)",
            color: "#0a0f24"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="px-4 py-1 rounded-full border border-cyan-400 bg-transparent hover:bg-cyan-400 transition-all"
        >
          Privacy Policy
        </motion.button>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Designed & Developed by <span className="text-cyan-400 font-semibold">Team Dhongorsho</span>
        </motion.p>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200 } }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-3 text-gray-800">Privacy Policy</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Unauthorized copying, distribution, or use of this application or its components
                is strictly prohibited. This software is licensed to <strong>Team Dhongorsho</strong> 
                and intended for internal use only.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
