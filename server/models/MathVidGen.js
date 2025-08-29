const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    resultPath: { type: String }, // local file path or S3 URL
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
