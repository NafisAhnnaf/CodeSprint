// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/scriptRoutes");
const { errorHandler } = require("./middlewares/errorMiddleware");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Mount API routes under /api
app.use("/api", routes);

// Serve static files from outputs (optional, but good for direct access)
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
