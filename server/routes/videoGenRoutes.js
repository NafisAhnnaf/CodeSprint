// vidGenRoutes.js

const express = require("express");
const router = express.Router();

const {
  generateAnimation,
  healthCheck,
} = require("../controllers/videoGenController");

// Generate video/animation
router.post("/", generateAnimation);

// Health check
router.get("/", healthCheck);

module.exports = router;
