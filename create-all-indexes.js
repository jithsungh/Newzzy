#!/usr/bin/env node

/**
 * Master Index Creation Script for Newzzy
 *
 * This script runs both server and backend index creation scripts
 * to ensure all collections are properly indexed for optimal performance.
 */

const { execSync } = require("child_process");
const path = require("path");

console.log("🚀 Starting MongoDB Index Creation for Newzzy...\n");

async function runIndexCreation() {
  try {
    // Change to server directory and run index creation
    console.log("📊 Creating server-side indexes...");
    console.log("   Working directory: server/");

    try {
      const serverOutput = execSync("npm run create-indexes", {
        cwd: path.join(__dirname, "server"),
        stdio: "inherit",
        encoding: "utf8",
      });
      console.log("✅ Server indexes created successfully!\n");
    } catch (error) {
      console.error("❌ Error creating server indexes:", error.message);
      console.log(
        "📝 Note: Make sure you have installed dependencies in the server directory.\n"
      );
    }

    // Change to backend directory and run index creation
    console.log("⚙️ Creating backend-specific indexes...");
    console.log("   Working directory: backend/");

    try {
      const backendOutput = execSync("npm run create-indexes", {
        cwd: path.join(__dirname, "backend"),
        stdio: "inherit",
        encoding: "utf8",
      });
      console.log("✅ Backend indexes created successfully!\n");
    } catch (error) {
      console.error("❌ Error creating backend indexes:", error.message);
      console.log(
        "📝 Note: Make sure you have installed dependencies in the backend directory.\n"
      );
    }

    console.log("🎉 Index creation process completed!");
    console.log(
      "\n📈 Your MongoDB collections are now optimized for better performance."
    );
    console.log("\n💡 Next steps:");
    console.log(
      "   1. Test your application to ensure all queries work as expected"
    );
    console.log("   2. Monitor query performance using .explain() method");
    console.log(
      "   3. Review the MongoDB Index Optimization Guide (MONGODB_INDEX_OPTIMIZATION.md)"
    );
    console.log("   4. Consider setting up regular index usage monitoring");
  } catch (error) {
    console.error("💥 Script execution failed:", error.message);
    process.exit(1);
  }
}

// Check if MongoDB connection details are available
console.log("🔍 Pre-flight checks...");

const serverEnvPath = path.join(__dirname, "server", ".env");
const backendEnvPath = path.join(__dirname, "backend", ".env");

const fs = require("fs");

if (!fs.existsSync(serverEnvPath) && !fs.existsSync(backendEnvPath)) {
  console.warn(
    "⚠️  Warning: No .env files found. Make sure MongoDB connection is configured."
  );
}

if (fs.existsSync(backendEnvPath)) {
  console.log("✅ Backend .env file found");
}

if (fs.existsSync(serverEnvPath)) {
  console.log("✅ Server .env file found (or using backend .env)");
}

console.log("✅ Pre-flight checks completed\n");

// Run the index creation
runIndexCreation();
