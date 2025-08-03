const express = require("express");
const router = express.Router();

const whiteboardController = require("../controllers/whiteboardController");
const protect = require("../middlewares/authMiddleware");

// Save a whiteboard instance:
router.post("/", protect, whiteboardController.saveWhiteboard);

// Get all whiteboards for a specific user
router.get("/", protect, whiteboardController.getAllWhiteboards);

// Get a single whiteboard for a specific user for a specific whiteboard
router.get("/:id", protect, whiteboardController.getWhiteboard);

module.exports = router;
