import React from "react";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import "./about.css";
// Corrected data structure for team members to include roles
const teamMembers = [
  { id: 1, name: "Tabib Hassan", role: "Frontend Developer" },
  { id: 2, name: "Nafis Ahnaf Jamil", role: "Backend Developer" },
  { id: 3, name: "Sieam Shahriare", role: "AI Developer" },
];

export default function About() {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <motion.section
        className="hero-section"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-text">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Welcome to Dhongorsho
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            We are a passionate team of developers, designers, and innovators.
            Our mission is to build next-generation digital experiences.
          </motion.p>
        </div>
        <Player src="/about-us.json" className="hero-lottie" autoplay loop />
      </motion.section>

      {/* Mission Section */}
      <motion.section
        className="mission-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <h2>Our Mission</h2>
        <p>
          We aim to empower businesses and individuals through creative
          technology solutions. From web development to AI-driven applications,
          we strive to make a meaningful impact.
        </p>
      </motion.section>

      {/* Team Section (Corrected) */}
      <motion.section
        className="team-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
        }}
      >
        <h2>Meet the Team</h2>
        <div className="team-grid">
          {/* Map over the structured teamMembers array */}
          {teamMembers.map((member) => (
            <motion.div
              key={member.id} // Use a unique ID for the key
              className="team-card"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <div className="avatar-placeholder">👤</div>
              {/* Use the member object properties directly */}
              <div>
                <h3>{member.name}</h3>
                <p>Role: {member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
