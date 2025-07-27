// server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const timeoutHandler = require("./middlewares/timeoutHandler");
const { allowedNodeEnvironmentFlags } = require("process");
require("dotenv").config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
require("./socket")(io);

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/session", sessionRoutes);
app.use(errorHandler);
app.use("/api/sessions", timeoutHandler(15000), sessionRoutes); // 15s timeout

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
