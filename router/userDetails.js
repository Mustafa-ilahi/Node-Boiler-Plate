const express = require("express");
const router = express.Router();
const userDetails = require("../controller/userDetails");
const isAuth = require("../middleware/isAuth");
const updateUserDetails = require("../controller/updateUserDetails");
const updatePassword = require("../controller/updatePassword");

router.get("/getUserDetails", isAuth, userDetails);
router.post("/updateUsername", isAuth, updateUserDetails);
router.post("/updatePassword", isAuth, updatePassword);

module.exports = router;
