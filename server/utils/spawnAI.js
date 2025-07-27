// utils/spawnAI.js
const { spawn } = require("child_process");
const path = require("path");

const spawnAI = (scriptFolder, contextData = {}) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "../scripts",
      scriptFolder,
      "main.py"
    );

    const child = spawn("python3", [scriptPath, JSON.stringify(contextData)]);
    let output = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (err) => {
      console.error(`[${scriptFolder}] stderr:`, err.toString());
    });

    child.on("error", (err) => {
      return reject(
        new Error(`[${scriptFolder}] failed to spawn: ${err.message}`)
      );
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`[${scriptFolder}] exited with code ${code}`));
      }
      resolve(output.trim());
    });
  });
};

module.exports = spawnAI;
