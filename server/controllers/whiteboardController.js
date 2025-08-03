// controllers/whiteboardController.js
const Whiteboard = require("../models/Whiteboard");
const asyncHandler = require("../middlewares/asyncHandler");

// Save Whiteboard to MongoDB
exports.saveWhiteboard = asyncHandler(async (req, res) => {
  try {
    const { drawingActions, actionIndex, answers, title } = req.body;
    const userId = req.user.userId;

    const newWhiteboard = new Whiteboard({
      user: userId,
      title,
      drawingActions,
      actionIndex,
      answers,
    });

    await newWhiteboard.save();

    res.status(201).json({ success: true, data: newWhiteboard });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
});

// Get content of saved Whiteboard by whiteboard ID
exports.getWhiteboard = asyncHandler(async (req, res) => {
  try {
    const whiteboard = await Whiteboard.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!whiteboard) {
      return res
        .status(404)
        .json({ success: false, message: "Whiteboard not found" });
    }

    res.status(200).json({ success: true, data: whiteboard });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
});

// Get all Whiteboards for display as drawer in the client side
exports.getAllWhiteboards = asyncHandler(async (req, res) => {
  try {
    const whiteboards = await Whiteboard.find({ user: req.user.userId }).sort({
      updatedAt: -1,
    });

    res.status(200).json({ success: true, data: whiteboards });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
});
