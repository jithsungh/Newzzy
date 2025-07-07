const User = require("../models/users");

const updateStreak = async (req, res, next) => {
  const logPrefix = "[STREAK_UPDATE]";

  try {
    // Step 1: Get user ID and fetch user
    const userId = req.user.id;
    console.log(
      `${logPrefix} ==================== STREAK UPDATE STARTED ====================`
    );
    console.log(
      `${logPrefix} User: ${userId} | Step 1: Processing streak for user ID: ${userId}`
    );

    const user = await User.findById(userId);

    if (!user) {
      console.error(
        `${logPrefix} User: ${userId} | Step 1 FAILED: User not found for ID: ${userId}`
      );
      return next();
    }

    // Create user identifier for all subsequent logs
    const userIdentifier = `${user.email} (${userId})`;

    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 1 SUCCESS: User found`
    );
    console.log(`${logPrefix} User: ${userIdentifier} | Current user state:`, {
      email: user.email,
      currentStreak: user.streak,
      lastActiveDate: user.lastActiveDate,
    });

    // Step 3: Calculate current time and dates in IST
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 3: Converting times to IST (GMT+5:30)...`
    );
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istNow = new Date(now.getTime() + istOffset);

    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 3: Time calculations:`,
      {
        currentUTC: now.toISOString(),
        currentIST: istNow.toISOString(),
        istOffsetHours: istOffset / (60 * 60 * 1000),
      }
    );

    // Get current date in IST and format as YYYY-MM-DD for consistent comparison
    const currentDateIST = new Date(
      istNow.getUTCFullYear(),
      istNow.getUTCMonth(),
      istNow.getUTCDate()
    );
    const todayStr = currentDateIST.toISOString().split("T")[0];
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 3: Today's date (IST): ${todayStr}`
    );

    // Step 4: Process last active date
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 4: Processing last active date...`
    );
    const lastActiveDate = user.lastActiveDate
      ? new Date(user.lastActiveDate)
      : null;
    let lastActiveDateIST = null;
    let lastActiveStr = null;

    if (lastActiveDate) {
      console.log(
        `${logPrefix} User: ${userIdentifier} | Step 4: Last active date found: ${lastActiveDate.toISOString()}`
      );
      const lastActiveISTTime = new Date(lastActiveDate.getTime() + istOffset);
      lastActiveDateIST = new Date(
        lastActiveISTTime.getUTCFullYear(),
        lastActiveISTTime.getUTCMonth(),
        lastActiveISTTime.getUTCDate()
      );
      lastActiveStr = lastActiveDateIST.toISOString().split("T")[0];
      console.log(
        `${logPrefix} User: ${userIdentifier} | Step 4: Last active date converted to IST: ${lastActiveStr}`
      );
    } else {
      console.log(
        `${logPrefix} User: ${userIdentifier} | Step 4: No previous last active date found (first time user)`
      );
    }

    // Step 5: Calculate yesterday's date in IST
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 5: Calculating yesterday's date...`
    );
    const yesterday = new Date(currentDateIST);
    yesterday.setUTCDate(currentDateIST.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 5: Yesterday's date (IST): ${yesterdayStr}`
    );

    // Step 6: Log all date comparisons
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 6: Date comparison summary:`,
      {
        todayIST: todayStr,
        yesterdayIST: yesterdayStr,
        lastActiveIST: lastActiveStr,
        currentStreakBeforeUpdate: user.streak,
      }
    );

    // Step 6.5: Check if user already active today
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 6.5: Checking if user already active today...`
    );
    if (lastActiveStr === todayStr) {
      console.log(
        `${logPrefix} User: ${userIdentifier} | Step 6.5 SKIP: User already active today (${todayStr})`
      );
      console.log(
        `${logPrefix} User: ${userIdentifier} | ==================== STREAK UPDATE SKIPPED (ALREADY TODAY) ====================`
      );
      return next();
    }
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 6.5 PASS: User not yet active today, proceeding...`
    );

    // Step 7: Streak calculation logic
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 7: Applying streak logic...`
    );
    let oldStreak = user.streak;
    let streakAction = "";

    if (!lastActiveDate || !lastActiveStr) {
      // First time user or invalid last active date
      streakAction = "FIRST_TIME_OR_INVALID";
      console.log(
        `${logPrefix} User: ${userIdentifier} | Step 7: First time user or invalid lastActiveDate. Setting streak to 1.`
      );
      user.streak = 1;
    } else if (lastActiveStr === yesterdayStr) {
      // User was active yesterday, increment streak
      streakAction = "INCREMENT";
      user.streak = (user.streak || 0) + 1;
      console.log(
        `${logPrefix} User: ${userIdentifier} | Step 7: User was active yesterday. Incrementing streak from ${oldStreak} to ${user.streak}`
      );
    } else {
      // User missed days, reset streak
      streakAction = "RESET";
      console.log(
        `${logPrefix} User: ${userIdentifier} | Step 7: User missed days. Resetting streak from ${oldStreak} to 1.`
      );
      user.streak = 1;
    }

    console.log(`${logPrefix} User: ${userIdentifier} | Step 7 RESULT:`, {
      action: streakAction,
      oldStreak: oldStreak,
      newStreak: user.streak,
      streakChange: user.streak - oldStreak,
    });

    // Step 8: Update user fields
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 8: Updating user fields...`
    );
    const oldLastActiveDate = user.lastActiveDate;

    user.lastActiveDate = now;

    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 8: Field updates:`,
      {
        lastActiveDate: {
          old: oldLastActiveDate ? oldLastActiveDate.toISOString() : "null",
          new: user.lastActiveDate.toISOString(),
        },
      }
    );

    // Step 9: Save to database
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 9: Saving to database...`
    );
    await user.save();
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 9 SUCCESS: User data saved to database`
    );

    // Step 10: Final success log
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 10: STREAK UPDATE COMPLETED SUCCESSFULLY`
    );
    console.log(`${logPrefix} User: ${userIdentifier} | Final state:`, {
      userEmail: user.email,
      finalStreak: user.streak,
      action: streakAction,
      lastActiveDate: user.lastActiveDate.toISOString(),
    });
    console.log(
      `${logPrefix} User: ${userIdentifier} | ==================== STREAK UPDATE COMPLETED ====================`
    );

    return next();
  } catch (error) {
    const userIdentifier = req.user?.id ? `${req.user.id}` : "unknown";
    console.error(
      `${logPrefix} User: ${userIdentifier} | ==================== STREAK UPDATE ERROR ====================`
    );
    console.error(`${logPrefix} User: ${userIdentifier} | Error details:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
    console.error(
      `${logPrefix} User: ${userIdentifier} | ==================== STREAK UPDATE FAILED ====================`
    );
    // Don't fail the request if streak update fails
    return next();
  }
};

module.exports = updateStreak;
