const request = require("supertest");
const express = require("express");
const aiRoutes = require("../routes/aiRoutes");
const sessionManager = require("../utils/sessionManager");

// Mock sessionManager methods
jest.mock("../utils/sessionManager");

// Mock auth middleware to bypass auth for testing
jest.mock("../middlewares/authMiddleware", () => (req, res, next) => {
  req.user = { userId: "user123", email: "user@example.com" };
  next();
});

// Mock Mongoose Session model's findByIdAndUpdate method
jest.mock("../models/Session", () => ({
  findByIdAndUpdate: jest.fn().mockResolvedValue({}),
}));
const Session = require("../models/Session");

const app = express();
app.use(express.json());
app.use("/api/ai", aiRoutes);

describe("AI Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/ai/start - starts a session", async () => {
    sessionManager.startSession.mockImplementation(() => {});

    const res = await request(app)
      .post("/api/ai/start")
      .send({ sessionId: "test123", userId: "user123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("AI and whiteboard session started.");
    expect(sessionManager.startSession).toHaveBeenCalledWith("test123", {
      userId: "user123",
    });
  });

  test("POST /api/ai/message - sends message to aiAgent and returns output", async () => {
    sessionManager.sendToProcess.mockResolvedValue("AI reply here");

    const res = await request(app)
      .post("/api/ai/message")
      .send({ sessionId: "test123", message: "Hello AI" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Message sent to AI agent.");
    expect(sessionManager.sendToProcess).toHaveBeenCalledWith(
      "test123",
      "aiAgent",
      { userMessage: "Hello AI" }
    );
  });

  test("POST /api/ai/generate-pptx - runs pptxGenerator script", async () => {
    sessionManager.runOneTimeScript.mockResolvedValue("pptx created");

    const res = await request(app)
      .post("/api/ai/generate-pptx")
      .send({ filePath: "/tmp/file.pptx" });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("pptx created");
    expect(sessionManager.runOneTimeScript).toHaveBeenCalledWith(
      "pptxGenerator",
      { path: "/tmp/file.pptx" }
    );
  });

  test("POST /api/ai/generate-quiz - runs quizGenerator script", async () => {
    sessionManager.runOneTimeScript.mockResolvedValue("quiz created");

    const res = await request(app)
      .post("/api/ai/generate-quiz")
      .send({ filePath: "/tmp/file.txt" });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe("quiz created");
    expect(sessionManager.runOneTimeScript).toHaveBeenCalledWith(
      "quizGenerator",
      { path: "/tmp/file.txt" }
    );
  });

  test("POST /api/ai/end - ends session", async () => {
    sessionManager.endSession.mockImplementation(() => {});
    Session.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post("/api/ai/end")
      .send({ sessionId: "test123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Session ended and processes terminated.");
    expect(sessionManager.endSession).toHaveBeenCalledWith("test123");
    expect(Session.findByIdAndUpdate).toHaveBeenCalledWith(
      "test123",
      expect.objectContaining({ expiresAt: expect.any(Date) })
    );
  });
});
