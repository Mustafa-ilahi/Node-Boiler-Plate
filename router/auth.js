const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");

router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);
router.post("/checkemail", authController.checkEmail);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword", authController.resetPassword);

module.exports = router;
