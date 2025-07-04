const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");

const VerifyJWT = require('../middlewares/verifyjwt.js');


router.put("/editname", VerifyJWT, profileController.editName);
router.put("/changepassword", VerifyJWT, profileController.changePassword);
router.put("/toggletheme", VerifyJWT, profileController.toggleTheme);
router.put("/resetinterests", VerifyJWT, profileController.resetInterests);
router.put("/updateprofilepicture", VerifyJWT, profileController.updateProfilePicture);
router.delete("/deleteaccount", VerifyJWT, profileController.deleteAccount);
router.post("/setinterests", VerifyJWT, profileController.StoreInitialInterests);

module.exports = router;
