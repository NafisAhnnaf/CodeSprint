const request = require("supertest");
const express = require("express");
const authRoutes = require("../routes/authRoutes");
const User = require("../models/User");
const { hashPassword, comparePasswords } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");

// Mock dependencies
jest.mock("../models/User");
jest.mock("../utils/hash");
jest.mock("../utils/jwt");

// Bypass token check by faking auth middleware
jest.mock("../middlewares/authMiddleware", () => (req, res, next) => {
  req.user = { userId: "userId123", email: "test@example.com" };
  next();
});

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    test("should register new user successfully", async () => {
      User.findOne.mockResolvedValue(null);
      hashPassword.mockResolvedValue("hashed_password");
      User.create.mockResolvedValue({
        _id: "userId123",
        username: "testuser",
        email: "test@example.com",
        password: "hashed_password",
      });

      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "mypassword",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toMatchObject({
        id: "userId123",
        username: "testuser",
        email: "test@example.com",
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(hashPassword).toHaveBeenCalledWith("mypassword");
      expect(User.create).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: "hashed_password",
      });
    });

    test("should fail if email already exists", async () => {
      User.findOne.mockResolvedValue({ email: "test@example.com" });

      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "mypassword",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Email already registered");
    });
  });

  describe("POST /api/auth/login", () => {
    test("should login successfully and return token", async () => {
      User.findOne.mockResolvedValue({
        _id: "userId123",
        email: "test@example.com",
        password: "hashed_password",
      });
      comparePasswords.mockResolvedValue(true);
      generateToken.mockReturnValue("jwt_token");

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "mypassword",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe("jwt_token");

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(comparePasswords).toHaveBeenCalledWith(
        "mypassword",
        "hashed_password"
      );
      expect(generateToken).toHaveBeenCalledWith({
        userId: "userId123",
        email: "test@example.com",
      });
    });

    test("should fail login with invalid email", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post("/api/auth/login").send({
        email: "notfound@example.com",
        password: "whatever",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid credentials");
    });

    test("should fail login with invalid password", async () => {
      User.findOne.mockResolvedValue({
        _id: "userId123",
        email: "test@example.com",
        password: "hashed_password",
      });
      comparePasswords.mockResolvedValue(false);

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  describe("GET /api/auth/profile", () => {
    test("should get user profile successfully", async () => {
      const fakeUser = {
        _id: "userId123",
        username: "testuser",
        email: "test@example.com",
      };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });

      const res = await request(app).get("/api/auth/profile");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toEqual(fakeUser);
      expect(User.findById).toHaveBeenCalledWith("userId123");
    });

    test("should return 404 if user not found", async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get("/api/auth/profile");

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User not found");
    });
  });
});
