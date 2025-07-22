const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const jobStore = require("../jobStore"); // In-memory job tracking object

// Generate a new script job
exports.generateScript = (req, res, next) => {
  try {
    const { inputText } = req.body;
    const jobId = uuidv4();
    const outputDir = path.join(__dirname, "..", "outputs", jobId);

    fs.mkdirSync(outputDir, { recursive: true });

    const scriptPath = path.join(__dirname, "..", "main.py");

    const python = spawn("python3", [scriptPath], { cwd: outputDir });

    python.stdin.write(inputText + "\n");
    python.stdin.end();

    jobStore[jobId] = {
      process: python,
      logs: [],
      completed: false,
      files: [],
    };

    python.stdout.on("data", (data) => {
      jobStore[jobId].logs.push(data.toString());
    });

    python.stderr.on("data", (data) => {
      jobStore[jobId].logs.push("[ERR] " + data.toString());
    });

    python.on("close", () => {
      jobStore[jobId].completed = true;
      try {
        jobStore[jobId].files = fs.readdirSync(outputDir);
      } catch {
        jobStore[jobId].files = [];
      }
    });

    res.json({ jobId });
  } catch (error) {
    next(error);
  }
};

// Check the status of a job
exports.getJobStatus = (req, res, next) => {
  const { jobId } = req.params;
  const job = jobStore[jobId];

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json({
    completed: job.completed,
    logs: job.logs,
    files: job.files,
  });
};

// Serve a specific result file
exports.getResultFile = (req, res) => {
  const { jobId, filename } = req.params;

  const filePath = path.join(__dirname, "..", "outputs", jobId, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", filePath);
      return res.status(404).send("File not found");
    }

    res.sendFile(filePath);
  });
};
