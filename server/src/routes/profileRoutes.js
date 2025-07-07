const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");

const verifyJWT = require("../middlewares/verifyjwt.js");
const updateStreak = require("../middlewares/updateStreak.js");

router.put("/editname", verifyJWT, updateStreak, profileController.editName);
router.put(
  "/changepassword",
  verifyJWT,
  updateStreak,
  profileController.changePassword
);
router.put(
  "/toggletheme",
  verifyJWT,
  updateStreak,
  profileController.toggleTheme
);
router.put(
  "/resetinterests",
  verifyJWT,
  updateStreak,
  profileController.resetInterests
);
router.put(
  "/updateprofilepicture",
  verifyJWT,
  updateStreak,
  profileController.updateProfilePicture
);
router.delete(
  "/deleteaccount",
  verifyJWT,
  updateStreak,
  profileController.deleteAccount
);
router.post(
  "/setinterests",
  verifyJWT,
  updateStreak,
  profileController.StoreInitialInterests
);
router.get("/getuser", verifyJWT, updateStreak, profileController.getUser);
router.get("/getstreak", verifyJWT, updateStreak, profileController.getStreak);

module.exports = router;
