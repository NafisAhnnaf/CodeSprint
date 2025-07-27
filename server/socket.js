// socket.js
module.exports = (io) => {
  const sessions = {};

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    sessions[socket.id] = { chatHistory: [] };

    socket.on("user_prompt", async (message) => {
      const spawnAI = require("./utils/spawnAI");
      try {
        sessions[socket.id].chatHistory.push({ role: "user", text: message });
        const response = await spawnAI(
          "agents/chat_agent.py",
          sessions[socket.id]
        );
        sessions[socket.id].chatHistory.push({ role: "ai", text: response });
        socket.emit("ai_response", response);
      } catch (err) {
        console.error("AI error:", err);
        socket.emit("ai_response", "Sorry, something went wrong.");
      }
    });

    socket.on("disconnect", () => {
      delete sessions[socket.id];
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
