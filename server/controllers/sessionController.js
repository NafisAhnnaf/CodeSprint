const Session = require("../models/Session");
const asyncHandler = require("../middlewares/asyncHandler");

// Create new session
exports.createSession = asyncHandler(async (req, res) => {
  const session = await Session.create(req.body);
  res.status(201).json({
    success: true,
    message: "Session created successfully",
    data: session,
  });
});

// Get all sessions by user ID
exports.getSessionsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const sessions = await Session.find({ user: userId });

  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions,
  });
});

// Update session (partial update)
exports.updateSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const updatedSession = await Session.findByIdAndUpdate(sessionId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedSession) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Session updated",
    data: updatedSession,
  });
});

// Mark session as ended
exports.endSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const endedSession = await Session.findByIdAndUpdate(
    sessionId,
    { status: "ended", endedAt: new Date() },
    { new: true }
  );

  if (!endedSession) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Session ended",
    data: endedSession,
  });
});
