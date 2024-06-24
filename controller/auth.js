const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const sendEmail = require("../helper/handleNodemailer");
const path = require("path");

require("dotenv").config();

exports.signUp = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const updatedEmail = email.toLowerCase();
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ status: 400, message: "All fields are required" });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;

    if (emailRegex.test(updatedEmail)) {
      if (!passwordRegex.test(password)) {
        if (password.length < 8) {
          return res.status(400).json({
            status: 400,
            message: "Password must be at least 8 characters long.",
          });
        } else if (!/(?=.*[a-z])/.test(password)) {
          return res.status(400).json({
            status: 400,
            message: "Password must include at least one lowercase letter.",
          });
        } else if (!/(?=.*[A-Z])/.test(password)) {
          return res.status(400).json({
            status: 400,
            message: "Password must include at least one uppercase letter.",
          });
        } else if (!/(?=.*\d)/.test(password)) {
          return res.status(400).json({
            status: 400,
            message: "Password must include at least one digit.",
          });
        } else if (!/(?=.*[@$!%*?&])/.test(password)) {
          return res.status(400).json({
            status: 400,
            message:
              "Password must include at least one special character (@, $, !, %, *, ?, or &).",
          });
        }
      } else {
        console.log("valid password");
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const existingUser = await User.findOne({ updatedEmail });
        if (existingUser) {
          return res
            .status(200)
            .json({ status: 200, message: "Email already exists" });
        }
        const newUser = await User.create({
          username,
          email: updatedEmail,
          password: hashedPassword,
        });
        const obj = {
          _id: newUser._id,
          email: newUser.email,
        };
        const jwtSecret = process.env.JWT_SECRET;
        const token = await jwt.sign(obj, jwtSecret);

        return res.status(200).json({
          status: 200,
          message: "Account created successfully",
          newUser,
          token,
        });
      }
    } else {
      return res.status(400).json({
        status: 400,
        message:
          "Please check your email format. It should have both @ and . symbols.",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const updatedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: updatedEmail });
    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        existingUser,
        updatedEmail,
      });
    }
    const hashedPassword = existingUser.password;
    const verifyPassword = await bcrypt.compare(password, hashedPassword);
    if (!verifyPassword) {
      return res
        .status(400)
        .json({ status: 400, message: "Incorrect Password" });
    }

    const obj = {
      email: existingUser.email,
      _id: existingUser._id,
    };
    const jwtSecret = process.env.JWT_SECRET;
    const token = await jwt.sign(obj, jwtSecret);
    return res.status(200).json({
      status: 200,
      message: "Login successfully",
      existingUser,
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};

exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingEmail = await User.findOne({ email });
    if (!existingEmail) {
      return res.status(200).json({
        status: 200,
        message: "You can use this email",
        isAvailable: true,
      });
    }
    return res.status(400).json({
      status: 400,
      message: "This email already exists",
      isAvailable: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!email) {
      return res
        .status(400)
        .json({ status: 400, message: "Email required!", email });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 400,
        message:
          "Please check your email format. It should have both @ and . symbols.",
      });
    }
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        status: 400,
        message: "User not found.",
      });
    }
    const htmlFilePath = path.join(__dirname, "../html/emailTemplate.html");
    const subject = "Forgot Password Request";
    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });
    await sendEmail(email, subject, htmlFilePath, otp);
    return res
      .status(200)
      .json({ status: 200, message: "Email sent successfully!", otp });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword, email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 400, message: "Email required!" });
    }
    if (!newPassword) {
      return res
        .status(400)
        .json({ status: 400, message: "New Password required!" });
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      if (newPassword.length < 8) {
        return res.status(400).json({
          status: 400,
          message: "Password must be at least 8 characters long.",
        });
      } else if (!/(?=.*[a-z])/.test(newPassword)) {
        return res.status(400).json({
          status: 400,
          message: "Password must include at least one lowercase letter.",
        });
      } else if (!/(?=.*[A-Z])/.test(newPassword)) {
        return res.status(400).json({
          status: 400,
          message: "Password must include at least one uppercase letter.",
        });
      } else if (!/(?=.*\d)/.test(newPassword)) {
        return res.status(400).json({
          status: 400,
          message: "Password must include at least one digit.",
        });
      } else if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
        return res.status(400).json({
          status: 400,
          message:
            "Password must include at least one special character (@, $, !, %, *, ?, or &).",
        });
      }
    } else {
      console.log("valid password");
      const salt = await bcrypt.genSalt(12);
      const newHashedPassword = await bcrypt.hash(newPassword, salt);
      const existingUser = await User.findOne({ email });
      const data = await User.findByIdAndUpdate(
        existingUser._id,
        { password: newHashedPassword },
        { new: true }
      );
      return res.status(200).json({
        status: 200,
        message: "Password updated successfully",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};
