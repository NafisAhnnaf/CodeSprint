const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
// POST /api/generate
const generateAnimation = async (req, res) => {
  try {
    console.log("Incoming Generate request");
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Path to main.py
    const scriptPath = path.resolve("../MathVideoAI/backend/main.py");

    // Spawn python process using system python3
    console.log("Spawning Python process with user prompt");
    const pythonProcess = spawn("python3", [scriptPath, prompt], {
      stdio: "pipe",
    });

    let outputData = "";
    let errorData = "";

    // Collect and log stdout
    pythonProcess.stdout.on("data", (data) => {
      const msg = data.toString();
      outputData += msg;
      console.log(`[Python stdout]: ${msg.trim()}`);
    });

    // Collect and log stderr
    pythonProcess.stderr.on("data", (data) => {
      const msg = data.toString();
      errorData += msg;
      console.error(`[Python stderr]: ${msg.trim()}`);
    });

    // On process exit
    pythonProcess.on("close", (code) => {
      console.log(`[Python process exited with code ${code}]`);

      if (code !== 0) {
        return res.status(500).json({
          error: "Python script failed",
          details: errorData || `Exit code: ${code}`,
        });
      }

      // Assume main.py writes output file in the same folder
      const outputFileName = "final_output.mp4"; // replace with actual filename
      const filePath = path.resolve(__dirname, "..", outputFileName);

      if (!fs.existsSync(filePath)) {
        return res
          .status(500)
          .json({ error: "Generated file not found", details: filePath });
      }

      return res.sendFile(filePath, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": "attachment; filename=animation.mp4",
        },
      });
    });
  } catch (error) {
    console.error("Error in generateAnimation:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /health
const healthCheck = (req, res) => {
  res.json({ status: "healthy" });
};

// Export in CommonJS
module.exports = {
  generateAnimation,
  healthCheck,
};
