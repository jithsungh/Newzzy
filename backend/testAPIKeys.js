require("dotenv").config(); // Load environment variables
const { APIKeyManager } = require("./src/utils/apiKeyManager");

async function testAPIKeySwapping() {
  console.log("🔧 Testing API Key Manager with Automatic Swapping\n");

  try {
    const manager = new APIKeyManager();

    // Show initial status
    console.log("📊 Initial API Key Status:");
    const status = manager.getStatus();
    console.log(`Total Keys: ${status.totalKeys}`);
    console.log(`Current Key: ${status.currentKey}`);
    console.log("Key Details:");
    status.keyStatus.forEach((key) => {
      console.log(
        `  - ${key.name}: ${key.status} (${key.requestCount} requests)`
      );
    });

    console.log("\n🧪 Testing API requests with automatic key swapping...\n");

    // Test multiple requests to demonstrate key rotation
    const testRequests = [
      { q: "technology", language: "en" },
      { q: "politics", language: "en" },
      { q: "business", language: "en" },
      { q: "science", language: "en" },
      { q: "health", language: "en" },
    ];

    for (const params of testRequests) {
      try {
        console.log(
          `🌐 Testing request with params: ${JSON.stringify(params)}`
        );
        const response = await manager.makeRequest(
          "https://newsdata.io/api/1/latest",
          params
        );

        if (response.data && response.data.results) {
          console.log(
            `✅ Success! Got ${response.data.results.length} articles`
          );
        } else {
          console.log("✅ Request successful but no results structure found");
        }
      } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);

        // If it's a rate limit error, show status
        if (error.message.includes("rate limited")) {
          const currentStatus = manager.getStatus();
          console.log("📊 Current key status after rate limit:");
          currentStatus.keyStatus.forEach((key) => {
            console.log(`  - ${key.name}: ${key.status}`);
          });
        }
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Show final status
    console.log("\n📊 Final API Key Status:");
    const finalStatus = manager.getStatus();
    finalStatus.keyStatus.forEach((key) => {
      console.log(
        `  - ${key.name}: ${key.status} (${key.requestCount} requests, ${key.failedAttempts} failures)`
      );
      if (key.lastUsed) {
        console.log(
          `    Last used: ${new Date(key.lastUsed).toLocaleTimeString()}`
        );
      }
    });
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Simulate a rate limit error for testing
async function simulateRateLimit() {
  console.log("\n🔧 Simulating Rate Limit Scenarios...\n");

  const manager = new APIKeyManager();

  // Manually mark first key as rate limited to test switching
  if (manager.apiKeys.length > 1) {
    console.log("⏳ Simulating rate limit on first key...");
    manager.markKeyRateLimited(0, 60); // Rate limit for 60 seconds

    // Try making a request - should automatically switch to next key
    try {
      const response = await manager.makeRequest(
        "https://newsdata.io/api/1/latest",
        {
          q: "test",
          language: "en",
        }
      );
      console.log("✅ Successfully switched to backup key");
    } catch (error) {
      console.log(`❌ Even backup keys failed: ${error.message}`);
    }
  } else {
    console.log("⚠️  Only one API key available, cannot test key switching");
  }
}

// Function to check environment variables
function checkEnvironmentSetup() {
  console.log("🔍 Checking Environment Variables...\n");

  const envKeys = Object.keys(process.env)
    .filter((key) => key.startsWith("NEWS_API_KEY"))
    .sort();

  if (envKeys.length === 0) {
    console.log("❌ No NEWS_API_KEY environment variables found!");
    console.log("Please set up your API keys like:");
    console.log("  NEWS_API_KEY=your_primary_key");
    console.log("  NEWS_API_KEY2=your_backup_key");
    console.log("  NEWS_API_KEY3=your_third_key");
    return false;
  }

  console.log(`✅ Found ${envKeys.length} API key(s):`);
  envKeys.forEach((key) => {
    const value = process.env[key];
    const maskedValue = value
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : "NOT SET";
    console.log(`  ${key}: ${maskedValue}`);
  });

  return true;
}

// Run tests
async function runAllTests() {
  console.log("🚀 API Key Manager Test Suite\n");
  console.log("=".repeat(60));

  // Check environment setup
  if (!checkEnvironmentSetup()) {
    return;
  }

  console.log("\n" + "=".repeat(60));

  // Test normal operation
  await testAPIKeySwapping();

  console.log("\n" + "=".repeat(60));

  // Test rate limit simulation
  await simulateRateLimit();

  console.log("\n✅ All tests completed!");
  console.log("\nTo use in your application:");
  console.log(
    'const { APIKeyManager } = require("./src/utils/apiKeyManager");'
  );
  console.log("const manager = new APIKeyManager();");
  console.log("const response = await manager.makeRequest(url, params);");
}

runAllTests().catch(console.error);
