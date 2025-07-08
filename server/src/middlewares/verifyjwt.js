const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

const verifyJWT = async (req, res, next) => {
  const logPrefix = "[VERIFY_JWT]";

  console.log(
    `${logPrefix} ==================== JWT VERIFICATION STARTED ====================`
  );

  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];
  const refreshToken = req.cookies?.refreshToken;

  console.log(`${logPrefix} User: unknown | Step 1: Checking for access token`);
  if (!accessToken) {
    console.log(
      `${logPrefix} User: unknown | Step 1 FAILED: Access token missing`
    );
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    console.log(`${logPrefix} User: unknown | Step 2: Verifying access token`);
    const decoded = await verifyToken(accessToken, ACCESS_SECRET);
    req.user = { id: decoded.id };
    res.locals.accessToken = accessToken;

    console.log(
      `${logPrefix} User: ${decoded.id} | Step 2 SUCCESS: Access token verified`
    );
    console.log(
      `${logPrefix} User: ${decoded.id} | ==================== JWT VERIFICATION COMPLETED ====================`
    );
    return next();
  } catch (accessErr) {
    console.log(
      `${logPrefix} User: unknown | Step 2 FAILED: Access token invalid, checking refresh token`
    );

    if (!refreshToken) {
      console.log(
        `${logPrefix} User: unknown | Step 3 FAILED: Refresh token missing`
      );
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    try {
      console.log(
        `${logPrefix} User: unknown | Step 3: Verifying refresh token`
      );
      const refreshDecoded = await verifyToken(refreshToken, REFRESH_SECRET);

      console.log(
        `${logPrefix} User: ${refreshDecoded.id} | Step 4: Generating new access token`
      );
      const newAccessToken = jwt.sign(
        { id: refreshDecoded.id },
        ACCESS_SECRET,
        { expiresIn: "15m" }
      );
      req.user = { id: refreshDecoded.id };
      res.locals.accessToken = newAccessToken;

      console.log(
        `${logPrefix} User: ${refreshDecoded.id} | Step 4 SUCCESS: New access token generated`
      );
      console.log(
        `${logPrefix} User: ${refreshDecoded.id} | ==================== JWT VERIFICATION COMPLETED ====================`
      );
      return next();
    } catch (refreshErr) {
      console.error(
        `${logPrefix} User: unknown | ==================== JWT VERIFICATION ERROR ====================`
      );
      console.error(
        `${logPrefix} User: unknown | Refresh token verification failed:`,
        {
          message: refreshErr.message,
          timestamp: new Date().toISOString(),
        }
      );
      // Return 403 to trigger frontend logout when refresh token is expired/invalid
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  }
};

const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};

module.exports = verifyJWT;
