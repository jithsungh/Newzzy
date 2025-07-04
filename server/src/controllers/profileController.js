const User = require("../models/users");
const bcrypt = require("bcryptjs");
// EDIT NAME

const editName = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    const newName = req.body.name;

    if (!userId || !newName) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID and name are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: newName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Name updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};
// change Password and verify old password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    const oldPassword = req.body.old_password;
    const newPassword = req.body.new_password;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "All fields are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "Old password is incorrect",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

// toggle theme
const toggleTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    const theme = req.body.theme; // 'light' or 'dark'

    if (!userId || !theme) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID and theme are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    user.theme = theme;
    await user.save();

    return res
      .status(200)
      .json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Theme updated successfully",
        theme: user.theme,
        user,
      });
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

//update profile picture
const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    const profileUrl = req.body.profile_url;

    if (!userId || !profileUrl) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID and profile URL are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profile_url: profileUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Profile picture updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

// Reset Interests
const resetInterests = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    if (!userId) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    user.interests = {}; // Reset interests to an empty object
    await user.save();

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Interests reset successfully",
      interests: user.interests,
      user
    });
  } catch (error) {
    console.error("Error resetting interests:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

// delete Account
// save the the user doc in deletedUsers collection then delete the user

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    if (!userId) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }
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
    // Delete user from users collection
    await User.findByIdAndDelete(userId);
    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

const StoreInitialInterests = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    const interests = req.body.interests; // Expecting an array of interests

    if (!userId || !Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID and interests are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User not found",
      });
    }

    // Convert interests array to an object with frequency map { interest: 1 }
    const interestsMap = {};
    interests.forEach((interest) => {
      interestsMap[interest] = 1;
    });

    user.interests = interestsMap;
    await user.save();

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Interests stored successfully",
      interests: user.interests,
      user
    });
  } catch (error) {
    console.error("Error storing initial interests:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
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
};
