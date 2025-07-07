const express = require("express");
const { getAPIKeyStatus, resetAPIKeys } = require("../controllers/newsfetcher");

const router = express.Router();

// Get API key status
router.get("/status", (req, res) => {
  try {
    const status = getAPIKeyStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Reset all API keys (admin function)
router.post("/reset", (req, res) => {
  try {
    resetAPIKeys();
    res.json({
      success: true,
      message: "All API keys have been reset",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get detailed API key statistics
router.get("/statistics", (req, res) => {
  try {
    const status = getAPIKeyStatus();

    const stats = {
      totalKeys: status.totalKeys,
      activeKeys: status.keyStatus.filter((k) => k.status === "active").length,
      rateLimitedKeys: status.keyStatus.filter(
        (k) => k.status === "rate_limited"
      ).length,
      failedKeys: status.keyStatus.filter((k) => k.status === "failed").length,
      totalRequests: status.keyStatus.reduce(
        (sum, k) => sum + k.requestCount,
        0
      ),
      totalFailures: status.keyStatus.reduce(
        (sum, k) => sum + k.failedAttempts,
        0
      ),
      currentKey: status.currentKey,
      keyDetails: status.keyStatus.map((key) => ({
        name: key.name,
        status: key.status,
        requestCount: key.requestCount,
        failedAttempts: key.failedAttempts,
        lastUsed: key.lastUsed ? new Date(key.lastUsed).toISOString() : null,
      })),
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
