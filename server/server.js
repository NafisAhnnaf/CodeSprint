// server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const whiteboardRoutes = require("./routes/whiteboardRoutes");
const videoGenRoutes = require("./routes/videoGenRoutes");
const timeoutHandler = require("./middlewares/timeoutHandler");
require("dotenv").config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
require("./socket")(io);

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/session", timeoutHandler(15000), sessionRoutes);
app.use("/api/whiteboard", whiteboardRoutes);
app.use("/api/generate", videoGenRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
