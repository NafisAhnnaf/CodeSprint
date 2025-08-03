import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Request from "../composables/Request";
import Heading from "../components/Heading";
import Subheading from "../components/Subheading";
import Muted from "../components/Muted";
import Unmuted from "../components/Unmuted";
import Button from "../components/Button";
import useAuth from "../auth/useAuth";
import "./profile.css"; // Import the new CSS file
// Import the new CSS file

const Profile = () => {
  const [user, setUser] = useState({
    username: "",
    _id: "",
    email: "",
    role: "Admin", // I've added a role for demonstration
  });
  const { logout } = useAuth();

  // Framer Motion variants for animations
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const infoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await Request.get("/api/auth/profile");
        // Ensure the fetched user data is used
        setUser(res.user);
        console.log(res.user);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="profile-page-container">
      <motion.div
        className="profile-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Heading content={"My Profile"} style={"profile-heading"} />

        <motion.div
          className="w-full space-y-8"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <Subheading content={"Basic Info"} style={"profile-subheading"} />

          <div className="info-grid">
            <motion.div variants={infoVariants}>
              <Muted content={"ID"} style={"text-gray-400"} />
            </motion.div>
            <motion.div variants={infoVariants}>
              <Unmuted content={user._id} style={"text-white"} />
            </motion.div>
            <motion.div variants={infoVariants}>
              <Muted content={"Name"} style={"text-gray-400"} />
            </motion.div>
            <motion.div variants={infoVariants}>
              <Unmuted content={user.username} style={"text-white"} />
            </motion.div>
            <motion.div variants={infoVariants}>
              <Muted content={"Email"} style={"text-gray-400"} />
            </motion.div>
            <motion.div variants={infoVariants}>
              <Unmuted content={user.email} style={"text-white"} />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="mt-8"
          variants={buttonVariants}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button
            label={"Logout"}
            bg="danger"
            onClick={() => logout()}
            // The existing button component likely handles hover/tap effects
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
