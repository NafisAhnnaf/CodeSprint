// models/Whiteboard.js
const mongoose = require("mongoose");

const whiteboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    default: "Untitled Whiteboard",
  },
  drawingActions: {
    type: Array,
    default: [],
  },
  actionIndex: {
    type: Number,
    default: 0,
  },
  answers: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

whiteboardSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Whiteboard", whiteboardSchema);
