const User = require("../models/users.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and Password are required" });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

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

    user.REFRESH_TOKEN = REFRESH_TOKEN;
    await user.save();

    res.cookie("refreshToken", REFRESH_TOKEN, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      user,
      AccessToken: ACCESS_TOKEN,
      message: "User logged in successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  const user = await User.findOne({ REFRESH_TOKEN: refreshToken });
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  await User.findOneAndUpdate({ _id: user._id }, { REFRESH_TOKEN: null });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({ success: true, message: "Logout successful" });
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const user = await User.findOne({ REFRESH_TOKEN: refreshToken });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const ACCESS_TOKEN = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      AccessToken: ACCESS_TOKEN,
      message: "Token refreshed successfully",
    });
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
};

const register = async (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.name) {
    return res.status(400).json({
      success: false,
      message: "Email, Name, and Password are required",
    });
  }

  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    await newUser.save();

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

    // Save refresh token in the DB
    newUser.REFRESH_TOKEN = REFRESH_TOKEN;
    await newUser.save();

    res.cookie("refreshToken", REFRESH_TOKEN, {
      httpOnly: true,
      sameSite: "None",
      secure: true, // ⛔ Add this if you're using HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      newUser,
      AccessToken: ACCESS_TOKEN,
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  login,
  register,
  logout,
  refreshToken,
};
