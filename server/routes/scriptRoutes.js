const express = require("express");
const router = express.Router();
const {
  generateScript,
  getJobStatus,
  getResultFile,
} = require("../controllers/scriptController");

router.post("/generate", generateScript);
router.get("/status/:jobId", getJobStatus);
router.get("/result/:jobId/:filename", getResultFile);

module.exports = router;
