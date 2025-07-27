module.exports = (ms) => (req, res, next) => {
  res.setTimeout(ms, () => {
    console.warn(`⏱️ Request timed out after ${ms}ms`);
    return res
      .status(503)
      .json({ success: false, message: "Request timeout. Please try again." });
  });
  next();
};
