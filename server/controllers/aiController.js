const sessionManager = require("../utils/sessionManager");
const Session = require("../models/Session");

exports.startAiSession = (req, res) => {
  const { sessionId, userId } = req.body;
  try {
    sessionManager.startSession(sessionId, { userId });
    res.status(200).json({ message: "AI and whiteboard session started." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessageToAi = (req, res) => {
  const { sessionId, message } = req.body;
  try {
    sessionManager.sendToProcess(sessionId, "aiAgent", {
      userMessage: message,
    });
    res.status(200).json({ message: "Message sent to AI agent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generatePPTX = async (req, res) => {
  try {
    const output = await sessionManager.runOneTimeScript("pptxGenerator", {
      path: req.body.filePath,
    });
    res.status(200).json({ result: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateQuiz = async (req, res) => {
  try {
    const output = await sessionManager.runOneTimeScript("quizGenerator", {
      path: req.body.filePath,
    });
    res.status(200).json({ result: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.endSession = async (req, res) => {
  const { sessionId } = req.body;
  try {
    sessionManager.endSession(sessionId);
    await Session.findByIdAndUpdate(sessionId, { expiresAt: new Date() });
    res
      .status(200)
      .json({ message: "Session ended and processes terminated." });
  } catch (err) {
    console.error("Error in endSession controller:", err);
    res.status(500).json({ error: err.message });
  }
};
