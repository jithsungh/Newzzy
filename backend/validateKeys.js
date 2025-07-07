require("dotenv").config();
const { APIKeyManager } = require("./src/utils/apiKeyManager");

async function validateAPIKeys() {
  console.log("🔍 Validating all API keys...\n");

  const manager = new APIKeyManager();
  const keys = manager.apiKeys;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    console.log(`🔑 Testing ${key.name}: ${key.key.substring(0, 12)}...`);

    try {
      // Try a simple request with each key individually
      const response = await manager.makeRequest(
        "https://newsdata.io/api/1/latest",
        {
          q: "test",
          language: "en",
          size: 1, // Request only 1 article to save quota
        }
      );

      if (response.data && response.data.results) {
        console.log(
          `   ✅ VALID - Got ${response.data.results.length} articles`
        );
        if (response.data.nextPage) {
          console.log(`   📊 Has more data available`);
        }
      } else {
        console.log(`   ⚠️  VALID but no results structure`);
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          console.log(`   ❌ INVALID - ${status}: Invalid API key`);
        } else if (status === 429) {
          console.log(`   ⏳ RATE LIMITED - Will be available later`);
        } else {
          console.log(
            `   ❓ ERROR - ${status}: ${
              error.response.data?.message || "Unknown error"
            }`
          );
        }
      } else {
        console.log(`   ❌ NETWORK ERROR - ${error.message}`);
      }
    }

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n🔧 Recommendations:");
  console.log("1. Remove or replace any INVALID keys");
  console.log("2. Wait for rate-limited keys to reset (usually 1 hour)");
  console.log("3. Consider getting additional API keys for higher throughput");
}

validateAPIKeys().catch(console.error);
