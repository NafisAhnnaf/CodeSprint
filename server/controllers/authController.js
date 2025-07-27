const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");
const { generateToken } = require("../utils/jwt");
const { hashPassword, comparePasswords } = require("../utils/hash");

// Register
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  console.log("[REGISTER] Request Body:", { username, email, password });

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("[REGISTER] Email already exists:", email);
    return res
      .status(400)
      .json({ success: false, message: "Email already registered" });
  }

  const hashedPassword = await hashPassword(password);
  console.log("[REGISTER] Hashed Password:", hashedPassword);

  const user = await User.create({ username, email, password: hashedPassword });
  console.log("[REGISTER] User created:", user);

  res.status(201).json({ success: true });
});

// Login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("[LOGIN] Attempting login for:", email);

  const user = await User.findOne({ email });
  if (!user) {
    console.log("[LOGIN] User not found:", email);
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await comparePasswords(password, user.password);
  console.log("[LOGIN] Password Match:", isMatch);

  if (!isMatch) {
    console.log("[LOGIN] Invalid password for:", email);
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken({ userId: user._id, email: user.email });
  console.log("[LOGIN] Token generated:", token);

  res.status(200).json({ success: true, token });
});

// Get Profile
exports.getProfile = asyncHandler(async (req, res) => {
  console.log("[GET PROFILE] Authenticated user ID:", req.user?.userId);

  const user = await User.findById(req.user.userId).select("-password");
  if (!user) {
    console.log("[GET PROFILE] User not found:", req.user.userId);
    return res.status(404).json({ success: false, message: "User not found" });
  }

  console.log("[GET PROFILE] User profile:", user);
  res.status(200).json({ success: true, user });
});
