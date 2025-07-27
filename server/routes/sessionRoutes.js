const express = require("express");
const router = express.Router();

const sessionController = require("../controllers/sessionController");
const protect = require("../middlewares/authMiddleware");

// Create a new session
router.post("/", protect, sessionController.createSession);

// Get all sessions for a specific user
router.get("/user/:userId", protect, sessionController.getSessionsByUser);

// Update an existing session
router.patch("/:sessionId", protect, sessionController.updateSession);

// Mark a session as ended
router.post("/:sessionId/end", protect, sessionController.endSession);

module.exports = router;
