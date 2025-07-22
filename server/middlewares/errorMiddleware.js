exports.errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    error: err.message || "Internal Server Error",
  });
};
