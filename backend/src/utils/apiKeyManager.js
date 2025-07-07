const axios = require("axios");

class APIKeyManager {
  constructor() {
    // Initialize with all available API keys from environment variables
    this.apiKeys = this.loadAPIKeys();
    this.currentKeyIndex = 0;
    this.keyStatus = new Map(); // Track status of each key
    this.rateLimitResets = new Map(); // Track when rate limits reset
    this.failedAttempts = new Map(); // Track failed attempts per key

    // Initialize status for all keys
    this.apiKeys.forEach((key, index) => {
      this.keyStatus.set(index, "active");
      this.failedAttempts.set(index, 0);
    });

    console.log(
      `🔑 Initialized API Key Manager with ${this.apiKeys.length} keys`
    );
  }

  loadAPIKeys() {
    const keys = [];

    // Load all NEWS_API_KEY* environment variables
    const envKeys = Object.keys(process.env)
      .filter((key) => key.startsWith("NEWS_API_KEY"))
      .sort(); // Sort to ensure consistent order

    envKeys.forEach((envKey) => {
      const apiKey = process.env[envKey];
      if (apiKey && apiKey.trim()) {
        keys.push({
          key: apiKey.trim(),
          name: envKey,
          lastUsed: null,
          requestCount: 0,
        });
      }
    });

    if (keys.length === 0) {
      throw new Error(
        "❌ No valid API keys found. Please set NEWS_API_KEY, NEWS_API_KEY2, etc. in environment variables"
      );
    }

    return keys;
  }

  getCurrentKey() {
    if (this.apiKeys.length === 0) {
      throw new Error("❌ No API keys available");
    }

    // Find next available key
    let attempts = 0;
    while (attempts < this.apiKeys.length) {
      const keyData = this.apiKeys[this.currentKeyIndex];
      const keyStatus = this.keyStatus.get(this.currentKeyIndex);

      // Check if key is available
      if (keyStatus === "active" && this.isKeyAvailable(this.currentKeyIndex)) {
        keyData.lastUsed = new Date();
        keyData.requestCount++;
        console.log(
          `🔑 Using API key: ${keyData.name} (Request #${keyData.requestCount})`
        );
        return keyData;
      }

      // Move to next key
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      attempts++;
    }

    // All keys are rate limited or failed
    const resetTime = this.getEarliestResetTime();
    if (resetTime) {
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      throw new Error(
        `⏳ All API keys are rate limited. Next available in ${waitTime} seconds`
      );
    }

    throw new Error("❌ All API keys are currently unavailable");
  }

  isKeyAvailable(keyIndex) {
    const resetTime = this.rateLimitResets.get(keyIndex);
    if (resetTime && Date.now() < resetTime) {
      return false; // Still rate limited
    }

    const failedCount = this.failedAttempts.get(keyIndex) || 0;
    return failedCount < 3; // Allow up to 3 consecutive failures
  }

  markKeyRateLimited(keyIndex, resetAfterSeconds = 3600) {
    const resetTime = Date.now() + resetAfterSeconds * 1000;
    this.rateLimitResets.set(keyIndex, resetTime);
    this.keyStatus.set(keyIndex, "rate_limited");

    const keyData = this.apiKeys[keyIndex];
    console.log(
      `⏳ API key ${keyData.name} rate limited until ${new Date(
        resetTime
      ).toLocaleTimeString()}`
    );

    // Auto-switch to next available key
    this.switchToNextKey();
  }

  markKeyFailed(keyIndex, error) {
    const failedCount = (this.failedAttempts.get(keyIndex) || 0) + 1;
    this.failedAttempts.set(keyIndex, failedCount);

    const keyData = this.apiKeys[keyIndex];
    console.log(
      `❌ API key ${keyData.name} failed (${failedCount}/3): ${error}`
    );

    if (failedCount >= 3) {
      this.keyStatus.set(keyIndex, "failed");
      console.log(
        `🚫 API key ${keyData.name} marked as failed after 3 attempts`
      );
    }

    this.switchToNextKey();
  }

  markKeySuccess(keyIndex) {
    // Reset failure count on successful request
    this.failedAttempts.set(keyIndex, 0);
    this.keyStatus.set(keyIndex, "active");

    // Clear rate limit if it was set
    if (this.rateLimitResets.has(keyIndex)) {
      this.rateLimitResets.delete(keyIndex);
    }
  }

  switchToNextKey() {
    const oldIndex = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

    if (this.currentKeyIndex !== oldIndex) {
      const newKey = this.apiKeys[this.currentKeyIndex];
      console.log(`🔄 Switched to API key: ${newKey.name}`);
    }
  }

  getEarliestResetTime() {
    let earliest = null;
    for (const resetTime of this.rateLimitResets.values()) {
      if (!earliest || resetTime < earliest) {
        earliest = resetTime;
      }
    }
    return earliest;
  }

  async makeRequest(url, params = {}) {
    let lastError = null;
    let attempts = 0;
    const maxAttempts = this.apiKeys.length;

    while (attempts < maxAttempts) {
      try {
        const keyData = this.getCurrentKey();
        const currentIndex = this.currentKeyIndex;

        // Add API key to params
        const requestParams = {
          ...params,
          apikey: keyData.key,
        };

        console.log(`🌐 Making request to ${url} with key ${keyData.name}`);

        const response = await axios.get(url, {
          params: requestParams,
          timeout: 15000, // 15 second timeout
        });

        // Mark key as successful
        this.markKeySuccess(currentIndex);

        console.log(`✅ Request successful with ${keyData.name}`);
        return response;
      } catch (error) {
        attempts++;
        lastError = error;

        if (error.response) {
          const status = error.response.status;
          const currentIndex = this.currentKeyIndex;

          if (status === 429) {
            // Rate limit exceeded
            const retryAfter = error.response.headers["retry-after"] || 3600;
            console.log(
              `⏳ Rate limit hit (429) for key. Retry after: ${retryAfter}s`
            );
            this.markKeyRateLimited(currentIndex, parseInt(retryAfter));
            continue; // Try next key
          } else if (status === 401 || status === 403) {
            // Invalid API key
            console.log(`🚫 Invalid API key (${status})`);
            this.markKeyFailed(currentIndex, `HTTP ${status}: Invalid API key`);
            continue; // Try next key
          } else if (status >= 500) {
            // Server error - retry with same key after delay
            console.log(
              `🔄 Server error (${status}), retrying in 5 seconds...`
            );
            await this.delay(5000);
            continue;
          } else {
            // Other HTTP error
            console.log(
              `❌ HTTP Error ${status}: ${
                error.response.data?.message || "Unknown error"
              }`
            );
            this.markKeyFailed(currentIndex, `HTTP ${status}`);
            continue;
          }
        } else {
          // Network or other error
          console.log(`❌ Request failed: ${error.message}`);
          const currentIndex = this.currentKeyIndex;
          this.markKeyFailed(currentIndex, error.message);

          // Wait before retry
          await this.delay(2000);
          continue;
        }
      }
    }

    // All attempts failed
    throw new Error(
      `❌ All API keys failed after ${attempts} attempts. Last error: ${lastError?.message}`
    );
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      totalKeys: this.apiKeys.length,
      currentKey: this.apiKeys[this.currentKeyIndex]?.name,
      keyStatus: Array.from(this.keyStatus.entries()).map(
        ([index, status]) => ({
          name: this.apiKeys[index].name,
          status,
          requestCount: this.apiKeys[index].requestCount,
          lastUsed: this.apiKeys[index].lastUsed,
          failedAttempts: this.failedAttempts.get(index) || 0,
        })
      ),
    };
  }

  resetAllKeys() {
    this.currentKeyIndex = 0;
    this.keyStatus.clear();
    this.rateLimitResets.clear();
    this.failedAttempts.clear();

    this.apiKeys.forEach((key, index) => {
      this.keyStatus.set(index, "active");
      this.failedAttempts.set(index, 0);
      key.requestCount = 0;
      key.lastUsed = null;
    });

    console.log("🔄 Reset all API keys to active status");
  }
}

module.exports = { APIKeyManager };
