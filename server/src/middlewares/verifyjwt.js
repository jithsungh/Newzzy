const jwt = require("jsonwebtoken");


const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // console.log("Auth Header:", authHeader);
  
  const accessToken = authHeader && authHeader.split(" ")[1]; // 'Bearer <token>'
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken)
    return res.status(401).json({ message: "Access token missing" });

  jwt.verify(accessToken, ACCESS_SECRET, (err, decoded) => {
    if (!err) {
      // ✅ Access token is valid
      req.user = { id: decoded.id };
      res.locals.accessToken = accessToken; // reuse same token
      return next();
    }

    // ❌ Access token invalid → try refresh token
    if (!refreshToken)
      return res.status(403).json({ message: "Refresh token missing" });

    jwt.verify(refreshToken, REFRESH_SECRET, (refreshErr, refreshDecoded) => {
      if (refreshErr)
        return res.status(403).json({ message: "Invalid refresh token" });

      // ✅ Refresh token valid → generate new access token
      const newAccessToken = jwt.sign(
        { id: refreshDecoded.id },
        ACCESS_SECRET,
        { expiresIn: "15m" }
      );

      req.user = { id: refreshDecoded.id };
      res.locals.accessToken = newAccessToken;
      next();
    });
  });
};

module.exports = verifyJWT;
