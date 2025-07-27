const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { verifyToken } = require("../utils/jwt"); // ✅ Corrected path
const protect = require("../middlewares/authMiddleware");

// Route: POST /api/ai/start
router.post("/start", protect, aiController.startAiSession);

// Route: POST /api/ai/message
router.post("/message", protect, aiController.sendMessageToAi);

// Route: POST /api/ai/generate-pptx
router.post("/generate-pptx", protect, aiController.generatePPTX);

// Route: POST /api/ai/generate-quiz
router.post("/generate-quiz", protect, aiController.generateQuiz);

// Route: POST /api/ai/end
router.post("/end", protect, aiController.endSession);

module.exports = router;
