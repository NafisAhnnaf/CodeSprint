const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // Fallback for development

// Generate JWT Token
exports.generateToken = (payload, expiresIn = "6h") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// Verify JWT Token
exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
