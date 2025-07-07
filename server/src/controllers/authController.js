const User = require("../models/users.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const logPrefix = "[AUTH_LOGIN]";

  console.log(
    `${logPrefix} ==================== LOGIN ATTEMPT STARTED ====================`
  );
  console.log(
    `${logPrefix} Request received for email: ${
      req.body.email || "not provided"
    }`
  );

  if (!req.body.email || !req.body.password) {
    console.log(`${logPrefix} Login failed: Missing email or password`);
    return res
      .status(400)
      .json({ success: false, message: "Email and Password are required" });
  }

  try {
    const { email, password } = req.body;
    console.log(
      `${logPrefix} User: ${email} | Step 1: Attempting login for email: ${email}`
    );

    console.log(
      `${logPrefix} User: ${email} | Step 1: Attempting login for email: ${email}`
    );

    const user = await User.findOne({ email });
    if (!user) {
      console.log(
        `${logPrefix} User: ${email} | Step 1 FAILED: User not found`
      );
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log(
      `${logPrefix} User: ${email} (${user._id}) | Step 2: User found, verifying password`
    );
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(
        `${logPrefix} User: ${email} (${user._id}) | Step 2 FAILED: Invalid password`
      );
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    console.log(
      `${logPrefix} User: ${email} (${user._id}) | Step 3: Password verified, generating tokens`
    );
    const REFRESH_TOKEN = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const ACCESS_TOKEN = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    console.log(
      `${logPrefix} User: ${email} (${user._id}) | Step 4: Tokens generated, saving refresh token`
    );
    user.REFRESH_TOKEN = REFRESH_TOKEN;
    await user.save();

    console.log(
      `${logPrefix} User: ${email} (${user._id}) | Step 4: Tokens generated, saving refresh token`
    );
    user.REFRESH_TOKEN = REFRESH_TOKEN;
    await user.save();

    console.log(
      `${logPrefix} User: ${email} (${user._id}) | Step 5: Setting refresh token cookie`
    );
    res.cookie("refreshToken", REFRESH_TOKEN, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(
      `${logPrefix} User: ${email} (${user._id}) | Step 6: Login successful, sending response`
    );
    res.status(200).json({
      success: true,
      user,
      AccessToken: ACCESS_TOKEN,
      message: "User logged in successfully",
    });
    console.log(
      `${logPrefix} User: ${email} (${user._id}) | ==================== LOGIN COMPLETED ====================`
    );
  } catch (err) {
    const email = req.body.email || "unknown";
    console.error(
      `${logPrefix} User: ${email} | ==================== LOGIN ERROR ====================`
    );
    console.error(`${logPrefix} User: ${email} | Error details:`, {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ success: false, message: err.message });
  }
};

const logout = async (req, res) => {
  const logPrefix = "[AUTH_LOGOUT]";

  console.log(
    `${logPrefix} ==================== LOGOUT ATTEMPT STARTED ====================`
  );

  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    console.log(
      `${logPrefix} User: unknown | Logout failed: No refresh token provided`
    );
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  try {
    console.log(
      `${logPrefix} User: unknown | Step 1: Looking up user by refresh token`
    );
    const user = await User.findOne({ REFRESH_TOKEN: refreshToken });
    if (!user) {
      console.log(
        `${logPrefix} User: unknown | Step 1 FAILED: User not found for refresh token`
      );
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userIdentifier = `${user.email} (${user._id})`;
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 2: User found, clearing refresh token`
    );

    await User.findOneAndUpdate({ _id: user._id }, { REFRESH_TOKEN: null });

    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 3: Clearing refresh token cookie`
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 4: Logout successful`
    );
    res.status(200).json({ success: true, message: "Logout successful" });
    console.log(
      `${logPrefix} User: ${userIdentifier} | ==================== LOGOUT COMPLETED ====================`
    );
  } catch (err) {
    console.error(
      `${logPrefix} User: unknown | ==================== LOGOUT ERROR ====================`
    );
    console.error(`${logPrefix} User: unknown | Error details:`, {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ success: false, message: err.message });
  }
};

const refreshToken = async (req, res) => {
  const logPrefix = "[AUTH_REFRESH_TOKEN]";

  console.log(
    `${logPrefix} ==================== TOKEN REFRESH STARTED ====================`
  );

  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    console.log(
      `${logPrefix} User: unknown | Token refresh failed: No refresh token provided`
    );
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    console.log(
      `${logPrefix} User: unknown | Step 1: Looking up user by refresh token`
    );
    const user = await User.findOne({ REFRESH_TOKEN: refreshToken });
    if (!user) {
      console.log(
        `${logPrefix} User: unknown | Step 1 FAILED: User not found for refresh token`
      );
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userIdentifier = `${user.email} (${user._id})`;
    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 2: User found, verifying refresh token`
    );

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 3: Refresh token verified, generating new access token`
    );
    const ACCESS_TOKEN = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    console.log(
      `${logPrefix} User: ${userIdentifier} | Step 4: New access token generated successfully`
    );
    res.json({
      success: true,
      AccessToken: ACCESS_TOKEN,
      message: "Token refreshed successfully",
    });
    console.log(
      `${logPrefix} User: ${userIdentifier} | ==================== TOKEN REFRESH COMPLETED ====================`
    );
  } catch (err) {
    console.error(
      `${logPrefix} User: unknown | ==================== TOKEN REFRESH ERROR ====================`
    );
    console.error(`${logPrefix} User: unknown | Error details:`, {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
};

const register = async (req, res) => {
  const logPrefix = "[AUTH_REGISTER]";

  console.log(
    `${logPrefix} ==================== REGISTRATION ATTEMPT STARTED ====================`
  );
  console.log(
    `${logPrefix} Request received for email: ${
      req.body.email || "not provided"
    }`
  );

  if (!req.body.email || !req.body.password || !req.body.name) {
    console.log(`${logPrefix} Registration failed: Missing required fields`);
    return res.status(400).json({
      success: false,
      message: "Email, Name, and Password are required",
    });
  }

  const { name, email, password } = req.body;

  try {
    console.log(
      `${logPrefix} User: ${email} | Step 1: Checking if user already exists`
    );
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(
        `${logPrefix} User: ${email} | Step 1 FAILED: User already exists`
      );
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    console.log(`${logPrefix} User: ${email} | Step 2: Hashing password`);
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`${logPrefix} User: ${email} | Step 3: Creating new user`);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    await newUser.save();
    console.log(
      `${logPrefix} User: ${email} (${newUser._id}) | Step 4: User created successfully`
    );

    console.log(
      `${logPrefix} User: ${email} (${newUser._id}) | Step 5: Generating tokens`
    );
    const REFRESH_TOKEN = jwt.sign(
      { id: newUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const ACCESS_TOKEN = jwt.sign(
      { id: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    console.log(
      `${logPrefix} User: ${email} (${newUser._id}) | Step 6: Saving refresh token to database`
    );
    // Save refresh token in the DB
    newUser.REFRESH_TOKEN = REFRESH_TOKEN;
    await newUser.save();

    console.log(
      `${logPrefix} User: ${email} (${newUser._id}) | Step 7: Setting refresh token cookie`
    );
    res.cookie("refreshToken", REFRESH_TOKEN, {
      httpOnly: true,
      sameSite: "None",
      secure: true, // ⛔ Add this if you're using HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log(
      `${logPrefix} User: ${email} (${newUser._id}) | Step 8: Registration successful, sending response`
    );
    const response = {
      success: true,
      newUser,
      AccessToken: ACCESS_TOKEN,
      message: "User registered successfully",
    };

    console.log(
      `${logPrefix} User: ${email} (${newUser._id}) | ==================== REGISTRATION COMPLETED ====================`
    );
    return res.status(201).json(response);
  } catch (err) {
    const email = req.body.email || "unknown";
    console.error(
      `${logPrefix} User: ${email} | ==================== REGISTRATION ERROR ====================`
    );
    console.error(`${logPrefix} User: ${email} | Error details:`, {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  login,
  register,
  logout,
  refreshToken,
};
