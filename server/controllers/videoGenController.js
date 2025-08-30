const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const Job = require("../models/MathVidGen.js");

// POST /api/generate
const generateAnimation = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }
  console.log("Received prompt:", prompt);

  // 1. Create job in DB
  const job = await Job.create({ prompt, status: "pending" });
  console.log("Created job with ID:", job._id);

  // 2. Run Python script asynchronously
  const scriptPath = path.resolve("../MathVideoAI/backend/main.py");
  const outputFileName = "final_output.mp4"; // match Python script
  const filePath = path.join(__dirname, "..", outputFileName);

  console.log("Spawning Python process:", scriptPath);
  const pythonProcess = spawn("python3", [scriptPath, prompt], {
    stdio: ["pipe", "pipe", "pipe"], // capture stdout and stderr
  });

  job.status = "running";
  await job.save();
  console.log("Job marked as running in DB");

  let errorData = "";

  // Stream stdout without formatting
  pythonProcess.stdout.on("data", (data) => {
    const msg = data.toString();
    process.stdout.write(`[Python stdout] ${msg}`);
  });

  // Stream stderr without formatting
  pythonProcess.stderr.on("data", (data) => {
    const msg = data.toString();
    process.stderr.write(`[Python stderr] ${msg}`);
    errorData += msg;
  });

  pythonProcess.on("close", async (code) => {
    console.log(`Python process exited with code ${code}`);

    if (code !== 0) {
      job.status = "failed";
      job.error = (errorData || `Exit code: ${code}`).trim();
      await job.save();
      console.log("Job failed:", job.error);
      return;
    }

    // SUCCESS case
    console.log("Python script finished successfully");
    if (errorData.trim()) {
      console.log(
        "stderr logs (likely FFmpeg info, not an error):\n",
        errorData
      );
    }

    if (fs.existsSync(filePath)) {
      job.status = "completed";
      job.resultPath = filePath;
      await job.save();
      console.log("Job completed successfully. File saved at:", filePath);
    } else {
      job.status = "failed";
      job.error = "Output file not found";
      await job.save();
      console.log("Job failed: Output file not found at", filePath);
    }
  });

  // 3. Respond immediately
  res.json({ jobId: job._id });
  console.log("Responded with jobId:", job._id);
};

// GET /api/status/:jobId
const getStatus = async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    console.log("Job not found:", req.params.jobId);
    return res.status(404).json({ error: "Job not found" });
  }
  res.json({ status: job.status, error: job.error || null });
};

// GET /api/result/:jobId
const getResult = async (req, res) => {
  console.log("Fetching result for job:", req.params.jobId);
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    console.log("Job not found:", req.params.jobId);
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.status !== "completed") {
    console.log("Job not completed yet:", job.status);
    return res.status(400).json({ error: "Job not completed yet" });
  }

  console.log("Sending file for job:", job._id);
  res.sendFile(job.resultPath, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": "attachment; filename=animation.mp4",
    },
  });
};

module.exports = { generateAnimation, getStatus, getResult };
