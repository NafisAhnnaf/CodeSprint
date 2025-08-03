import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import loaderLottie from "../assets/loading.json";  // Add your loader JSON file here

const LoaderOverlay = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);  // Simulate loading time (adjust as needed)

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0f24] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Player
            src={loaderLottie}
            className="w-48 h-48"
            style={{ transform: 'scale(1.8)' }}
            loop
            autoplay
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoaderOverlay;
