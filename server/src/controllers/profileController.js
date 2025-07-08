const User = require("../models/users");
const bcrypt = require("bcryptjs");
const DeletedUser = require("../models/deletedUsers");
const Recommendation = require("../models/recommendations");

// EDIT NAME
const editName = async (req, res) => {
  const logPrefix = "[EDIT_NAME]";

  console.log(
    `${logPrefix} ==================== EDIT NAME STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    const newName = req.body.name;

    console.log(
      `${logPrefix} User: ${userId} | Step 1: Validating input parameters`
    );

    if (!userId || !newName) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: Missing required parameters`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID and name are required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Updating user name to: ${newName}`
    );
    const user = await User.findByIdAndUpdate(
      userId,
      { name: newName },
      { new: true }
    );

    if (!user) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 3: Name updated successfully`
    );
    const response = {
      success: true,
      AccessToken: tokenToReturn,
      message: "Name updated successfully",
      user,
    };

    console.log(
      `${logPrefix} User: ${userId} | ==================== EDIT NAME COMPLETED ====================`
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== EDIT NAME ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        newName: req.body.name,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
    });
  }
};
// change Password and verify old password
const changePassword = async (req, res) => {
  const logPrefix = "[CHANGE_PASSWORD]";

  console.log(
    `${logPrefix} ==================== CHANGE PASSWORD STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    const oldPassword = req.body.old_password;
    const newPassword = req.body.new_password;

    console.log(
      `${logPrefix} User: ${userId} | Step 1: Validating input parameters`
    );

    if (!userId || !oldPassword || !newPassword) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: Missing required fields`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "All fields are required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Finding user and verifying old password`
    );
    const user = await User.findById(userId);
    if (!user) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 3: Verifying old password`
    );
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.log(
        `${logPrefix} User: ${userId} | Step 3 FAILED: Old password is incorrect`
      );
      return res.status(401).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "Old password is incorrect",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 4: Hashing new password and updating`
    );
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    console.log(
      `${logPrefix} User: ${userId} | Step 5: Password changed successfully`
    );
    const response = {
      success: true,
      AccessToken: tokenToReturn,
      message: "Password changed successfully",
    };

    console.log(
      `${logPrefix} User: ${userId} | ==================== CHANGE PASSWORD COMPLETED ====================`
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== CHANGE PASSWORD ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
    });
  }
};

// toggle theme
const toggleTheme = async (req, res) => {
  const logPrefix = "[TOGGLE_THEME]";

  console.log(
    `${logPrefix} ==================== TOGGLE THEME STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    const theme = req.body.theme; // 'light' or 'dark'

    console.log(
      `${logPrefix} User: ${userId} | Step 1: Validating theme change to: ${theme}`
    );

    if (!userId || !theme) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: Missing required parameters`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID and theme are required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Finding user and updating theme`
    );
    const user = await User.findById(userId);
    if (!user) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 3: Updating theme from ${user.theme} to ${theme}`
    );
    user.theme = theme;
    await user.save();

    console.log(
      `${logPrefix} User: ${userId} | Step 4: Theme updated successfully`
    );
    const response = {
      success: true,
      AccessToken: tokenToReturn,
      message: "Theme updated successfully",
      theme: user.theme,
      user,
    };

    console.log(
      `${logPrefix} User: ${userId} | ==================== TOGGLE THEME COMPLETED ====================`
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== TOGGLE THEME ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        requestedTheme: req.body.theme,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
    });
  }
};

//update profile picture
const updateProfilePicture = async (req, res) => {
  const logPrefix = "[UPDATE_PROFILE_PICTURE]";

  console.log(
    `${logPrefix} ==================== UPDATE PROFILE PICTURE STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    const profileUrl = req.body.profile_url;

    console.log(
      `${logPrefix} User: ${userId} | Step 1: Validating profile picture update`
    );

    if (!userId || !profileUrl) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: Missing required parameters`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID and profile URL are required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Updating profile picture URL`
    );
    const user = await User.findByIdAndUpdate(
      userId,
      { profile_url: profileUrl },
      { new: true }
    );

    if (!user) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 3: Profile picture updated successfully`
    );
    const response = {
      success: true,
      AccessToken: tokenToReturn,
      message: "Profile picture updated successfully",
      user,
    };

    console.log(
      `${logPrefix} User: ${userId} | ==================== UPDATE PROFILE PICTURE COMPLETED ====================`
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== UPDATE PROFILE PICTURE ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        profileUrl: req.body.profile_url,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
    });
  }
};

// Reset Interests
const resetInterests = async (req, res) => {
  const logPrefix = "[RESET_INTERESTS]";

  console.log(
    `${logPrefix} ==================== RESET INTERESTS STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(`${logPrefix} User: ${userId} | Step 1: Validating user ID`);

    if (!userId) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: User ID is required`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Finding user and resetting interests`
    );
    const user = await User.findById(userId);
    if (!user) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 3: Resetting interests to empty object`
    );
    user.interests = {}; // Reset interests to an empty object
    await user.save();

    console.log(
      `${logPrefix} User: ${userId} | Step 4: Deleting all existing recommendations for user`
    );
    const deletedRecommendations = await Recommendation.deleteMany({
      user_id: userId,
    });
    console.log(
      `${logPrefix} User: ${userId} | Step 4 RESULT: Deleted ${deletedRecommendations.deletedCount} recommendations`
    );

    console.log(
      `${logPrefix} User: ${userId} | Step 5: Interests reset and recommendations cleared successfully`
    );
    const response = {
      success: true,
      AccessToken: tokenToReturn,
      message: "Interests reset successfully",
      interests: user.interests,
      user,
    };

    console.log(
      `${logPrefix} User: ${userId} | ==================== RESET INTERESTS COMPLETED ====================`
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== RESET INTERESTS ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
    });
  }
};

// delete Account
// save the the user doc in deletedUsers collection then delete the user
const deleteAccount = async (req, res) => {
  const logPrefix = "[DELETE_ACCOUNT]";

  console.log(
    `${logPrefix} ==================== DELETE ACCOUNT STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(`${logPrefix} User: ${userId} | Step 1: Validating user ID`);

    if (!userId) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: User ID is required`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Finding user to delete`
    );
    const user = await User.findById(userId);
    if (!user) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 3: Saving user to deletedUsers collection`
    );
    // Save user to deletedUsers collection
    const deletedUser = new DeletedUser({
      name: user.name,
      password: user.password,
      profile_url: user.profile_url,
      email: user.email,
      interests: user.interests,
      theme: user.theme,
      deletedAt: new Date(),
    });
    await deletedUser.save();

    console.log(
      `${logPrefix} User: ${userId} | Step 4: Deleting user from users collection`
    );
    // Delete user from users collection
    await User.findByIdAndDelete(userId);

    console.log(
      `${logPrefix} User: ${userId} | Step 5: Account deleted successfully`
    );
    const response = {
      success: true,
      AccessToken: tokenToReturn,
      message: "Account deleted successfully",
    };

    console.log(
      `${logPrefix} User: ${userId} | ==================== DELETE ACCOUNT COMPLETED ====================`
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== DELETE ACCOUNT ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
    });
  }
};

const StoreInitialInterests = async (req, res) => {
  const logPrefix = "[STORE_INITIAL_INTERESTS]";

  console.log(
    `${logPrefix} ==================== STORE INITIAL INTERESTS STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    const interests = req.body.interests; // Expecting an array of interests

    console.log(
      `${logPrefix} User: ${userId} | Step 1: Validating interests array - received ${
        Array.isArray(interests) ? interests.length : 0
      } interests`
    );

    if (!userId || !Array.isArray(interests)) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: User ID and interests array are required`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID and interests are required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Finding user and storing interests`
    );
    const user = await User.findById(userId);
    if (!user) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 3: Converting interests array to frequency map`
    );
    // Convert interests array to an object with frequency map { interest: 1 }
    const interestsMap = {};
    interests.forEach((interest) => {
      interestsMap[interest] = 1;
    });

    console.log(
      `${logPrefix} User: ${userId} | Step 4: Saving interests to user profile`
    );
    user.interests = interestsMap;
    await user.save();

    console.log(
      `${logPrefix} User: ${userId} | Step 5: Initial interests stored successfully`
    );
    const response = {
      success: true,
      AccessToken: tokenToReturn,
      message: "Interests stored successfully",
      interests: user.interests,
      user,
    };

    console.log(
      `${logPrefix} User: ${userId} | ==================== STORE INITIAL INTERESTS COMPLETED ====================`
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== STORE INITIAL INTERESTS ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        interestsCount: Array.isArray(req.body.interests)
          ? req.body.interests.length
          : 0,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
    });
  }
};

const getUser = async (req, res) => {
  const logPrefix = "[GET_USER]";

  console.log(
    `${logPrefix} ==================== GET USER STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(`${logPrefix} User: ${userId} | Step 1: Fetching user details`);

    if (!userId) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: User ID is required`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Finding user in database`
    );
    const user = await User.findById(userId);
    if (!user) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 3: User details retrieved successfully`
    );
    const response = {
      success: true,
      AccessToken: tokenToReturn,
      user,
    };

    console.log(
      `${logPrefix} User: ${userId} | ==================== GET USER COMPLETED ====================`
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== GET USER ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
    });
  }
};

const getStreak = async (req, res) => {
  const logPrefix = "[GET_STREAK]";

  console.log(
    `${logPrefix} ==================== GET STREAK STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(`${logPrefix} User: ${userId} | Step 1: Validating user ID`);

    if (!userId) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: User ID is required`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    console.log(`${logPrefix} User: ${userId} | Step 2: Finding user`);
    const user = await User.findById(userId);
    if (!user) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 3: User streak retrieved successfully`
    );
    const response = {
      success: true,
      AccessToken: tokenToReturn,
      message: "User streak retrieved successfully",
      streak: user.streak,
    };

    console.log(
      `${logPrefix} User: ${userId} | ==================== GET STREAK COMPLETED ====================`
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== GET STREAK ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
    });
  }
};

// Check if user has sufficient interests for personalized recommendations
const checkUserInterests = async (req, res) => {
  const logPrefix = "[CHECK_USER_INTERESTS]";

  console.log(
    `${logPrefix} ==================== CHECK USER INTERESTS STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(`${logPrefix} User: ${userId} | Step 1: Validating user ID`);

    if (!userId) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: User ID is required`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Finding user and checking interests`
    );
    const user = await User.findById(userId);
    if (!user) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    // Check if user has interests and if they have at least 3 categories
    const interests = user.interests || {};
    const interestCount = Object.keys(interests).length;
    const hasSufficientInterests = interestCount >= 3;

    console.log(
      `${logPrefix} User: ${userId} | Step 3: User has ${interestCount} interests (sufficient: ${hasSufficientInterests})`
    );

    const response = {
      success: true,
      AccessToken: tokenToReturn,
      hasSufficientInterests,
      interestCount,
      interests: user.interests,
    };

    console.log(
      `${logPrefix} User: ${userId} | ==================== CHECK USER INTERESTS COMPLETED ====================`
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== CHECK USER INTERESTS ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
    });
  }
};

module.exports = {
  editName,
  changePassword,
  toggleTheme,
  updateProfilePicture,
  resetInterests,
  deleteAccount,
  StoreInitialInterests,
  getUser,
  getStreak,
  checkUserInterests,
};
