const User = require("../models/users");

/**
 * Resets streakUpdatedToday flag for all users
 * This should be called daily (typically at midnight IST)
 */
const resetDailyStreakFlags = async () => {
  const logPrefix = "[STREAK_RESET]";

  try {
    console.log(
      `${logPrefix} ==================== DAILY STREAK RESET STARTED ====================`
    );
    console.log(
      `${logPrefix} Action: Daily reset | Starting at: ${new Date().toISOString()}`
    );

    // Count users before reset
    const usersWithFlagSet = await User.countDocuments({
      streakUpdatedToday: true,
    });
    console.log(
      `${logPrefix} Action: Count check | Users with streakUpdatedToday=true before reset: ${usersWithFlagSet}`
    );

    // Get sample of users for detailed logging (first 5)
    const sampleUsers = await User.find({ streakUpdatedToday: true })
      .limit(5)
      .select("email _id");
    if (sampleUsers.length > 0) {
      console.log(
        `${logPrefix} Action: Sample users | Users to be reset (sample):`,
        sampleUsers.map((u) => `${u.email} (${u._id})`)
      );
    }

    // Perform the reset
    console.log(
      `${logPrefix} Action: Database update | Executing reset operation...`
    );
    const result = await User.updateMany(
      { streakUpdatedToday: true },
      { $set: { streakUpdatedToday: false } }
    );

    console.log(
      `${logPrefix} Action: Database update | Reset operation completed:`,
      {
        acknowledged: result.acknowledged,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount,
      }
    );

    // Verify the reset
    const usersStillWithFlag = await User.countDocuments({
      streakUpdatedToday: true,
    });
    console.log(
      `${logPrefix} Action: Verification | Users with streakUpdatedToday=true after reset: ${usersStillWithFlag}`
    );

    if (usersStillWithFlag === 0) {
      console.log(
        `${logPrefix} Action: Verification | SUCCESS: All ${result.modifiedCount} users' streak flags reset successfully`
      );
    } else {
      console.warn(
        `${logPrefix} Action: Verification | WARNING: ${usersStillWithFlag} users still have streakUpdatedToday=true`
      );
    }

    console.log(
      `${logPrefix} Action: Daily reset | ==================== DAILY STREAK RESET COMPLETED ====================`
    );
    return result;
  } catch (error) {
    console.error(
      `${logPrefix} Action: Daily reset | ==================== DAILY STREAK RESET ERROR ====================`
    );
    console.error(
      `${logPrefix} Action: Error handling | Error resetting daily streak flags:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    console.error(
      `${logPrefix} Action: Daily reset | ==================== DAILY STREAK RESET FAILED ====================`
    );
    throw error;
  }
};

/**
 * Sets up a daily cron job to reset streak flags
 * Runs every day at midnight IST (GMT+5:30)
 */
const scheduleStreakReset = () => {
  const logPrefix = "[STREAK_SCHEDULER]";

  console.log(
    `${logPrefix} Action: Setup | ==================== STREAK SCHEDULER SETUP ====================`
  );

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

  console.log(
    `${logPrefix} Action: Time calculation | Current time: ${now.toISOString()}`
  );
  console.log(
    `${logPrefix} Action: Time calculation | IST offset: ${
      istOffset / (60 * 60 * 1000)
    } hours`
  );

  // Calculate next midnight in IST
  const istNow = new Date(now.getTime() + istOffset);
  console.log(
    `${logPrefix} Action: Time calculation | Current IST time: ${istNow.toISOString()}`
  );

  const nextMidnightIST = new Date(istNow);
  nextMidnightIST.setUTCHours(24, 0, 0, 0); // Next midnight in IST context
  console.log(
    `${logPrefix} Action: Time calculation | Next midnight IST: ${nextMidnightIST.toISOString()}`
  );

  // Convert back to UTC for setTimeout
  const nextMidnightUTC = new Date(nextMidnightIST.getTime() - istOffset);
  const msUntilMidnight = nextMidnightUTC.getTime() - now.getTime();

  console.log(
    `${logPrefix} Action: Time calculation | Next midnight UTC: ${nextMidnightUTC.toISOString()}`
  );
  console.log(
    `${logPrefix} Action: Time calculation | Time until next reset: ${Math.round(
      msUntilMidnight / 1000 / 60
    )} minutes`
  );

  // Set timeout for the first execution
  setTimeout(() => {
    console.log(
      `${logPrefix} Action: Scheduled execution | Executing first scheduled reset...`
    );
    resetDailyStreakFlags();

    // Then set interval for every 24 hours
    setInterval(() => {
      console.log(
        `${logPrefix} Action: Scheduled execution | Executing daily scheduled reset...`
      );
      resetDailyStreakFlags();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  }, msUntilMidnight);

  console.log(
    `${logPrefix} Action: Setup | Scheduled daily streak reset for IST timezone.`
  );
  console.log(
    `${logPrefix} Action: Setup | Next reset in ${Math.round(
      msUntilMidnight / 1000 / 60
    )} minutes`
  );
  console.log(
    `${logPrefix} Action: Setup | Next reset at: ${nextMidnightUTC.toISOString()} UTC (${new Date(
      nextMidnightUTC.getTime() + istOffset
    ).toISOString()} IST)`
  );
  console.log(
    `${logPrefix} Action: Setup | ==================== STREAK SCHEDULER SETUP COMPLETED ====================`
  );
};

module.exports = {
  resetDailyStreakFlags,
  scheduleStreakReset,
};
