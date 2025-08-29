// vidGenRoutes.js

const express = require("express");
const router = express.Router();

const {
  generateAnimation,
  getStatus,
  getResult,
} = require("../controllers/videoGenController");

// Generate video/animation
router.post("/", generateAnimation);
router.get("/status/:jobId", getStatus);
router.get("/result/:jobId", getResult);


module.exports = router;
