const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatHistory: {
      type: Array,
      default: [],
    },
    quizResults: {
      type: Object,
      default: {},
    },
    uploadedFiles: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },
    endedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
