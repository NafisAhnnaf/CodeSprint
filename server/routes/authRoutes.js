const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/profile", protect, asyncHandler(getProfile));
module.exports = router;
