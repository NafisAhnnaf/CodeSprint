const { spawn } = require("child_process");
const path = require("path");

const activeSessions = {}; // Tracks session-related child processes

const SCRIPT_PATHS = {
  aiAgent: path.join(__dirname, "../scripts/ai_agent/main.py"),
  whiteboard: path.join(__dirname, "../scripts/whiteboard/main.py"),
  pptxGenerator: path.join(__dirname, "../scripts/pptx_generator/main.py"),
  quizGenerator: path.join(__dirname, "../scripts/quiz_generator/main.py"),
};

// Internal utility to spawn a child process
function startPersistentScript(scriptPath, inputData) {
  const child = spawn("python3", [scriptPath], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  if (inputData) {
    child.stdin.write(JSON.stringify(inputData) + "\n");
    // Don’t end the stdin; keep process alive for session
  }

  return child;
}

exports.startSession = (sessionId, initialData = {}) => {
  if (activeSessions[sessionId]) return;

  const aiAgentProcess = startPersistentScript(
    SCRIPT_PATHS.aiAgent,
    initialData
  );
  const whiteboardProcess = startPersistentScript(
    SCRIPT_PATHS.whiteboard,
    initialData
  );

  activeSessions[sessionId] = {
    processes: {
      aiAgent: aiAgentProcess,
      whiteboard: whiteboardProcess,
    },
    history: [],
  };

  // Optional: log output or broadcast to frontend
  aiAgentProcess.stdout.on("data", (data) => {
    console.log(`[${sessionId}] AI Agent:`, data.toString());
  });

  whiteboardProcess.stdout.on("data", (data) => {
    console.log(`[${sessionId}] Whiteboard:`, data.toString());
  });

  aiAgentProcess.stderr.on("data", (err) => {
    console.error(`[${sessionId}] AI Agent Error:`, err.toString());
  });

  whiteboardProcess.stderr.on("data", (err) => {
    console.error(`[${sessionId}] Whiteboard Error:`, err.toString());
  });
};

// Sends data to aiAgent or whiteboard processes
exports.sendToProcess = (sessionId, processKey, payload) => {
  return new Promise((resolve, reject) => {
    const session = activeSessions[sessionId];
    if (!session) return reject(new Error("Session not found"));
    const proc = session.processes[processKey];
    if (!proc) return reject(new Error(`Process ${processKey} not running`));

    let output = "";

    const onData = (data) => {
      output += data.toString();
    };

    const onClose = () => {
      proc.stdout.off("data", onData); // cleanup listener
      resolve(output.trim());
    };

    proc.stdout.once("data", onData); // Capture next response
    proc.stdout.once("end", onClose); // Resolve when stream ends (rare for persistent)
    proc.stdin.write(JSON.stringify(payload) + "\n");
  });
};

// One-time utility scripts
exports.runOneTimeScript = (scriptKey, inputData = {}) => {
  return new Promise((resolve, reject) => {
    const scriptPath = SCRIPT_PATHS[scriptKey];
    if (!scriptPath) return reject(new Error("Invalid script key"));

    const child = spawn("python3", [scriptPath, JSON.stringify(inputData)]);
    let output = "";

    child.stdout.on("data", (data) => (output += data.toString()));
    child.stderr.on("data", (err) =>
      console.error(`${scriptKey} stderr:`, err.toString())
    );

    child.on("close", (code) => {
      if (code !== 0)
        return reject(new Error(`${scriptKey} exited with code ${code}`));
      resolve(output.trim());
    });
  });
};

exports.endSession = (sessionId) => {
  const session = activeSessions[sessionId];
  if (!session) return;

  for (const key of Object.keys(session.processes)) {
    session.processes[key]?.kill("SIGTERM");
  }

  delete activeSessions[sessionId];
};
