const User = require("../models/user");
const bcrypt = require("bcrypt");

module.exports = async (req, res, next) => {
  try {
    const _id = req._id;
    const { password, newPassword } = req.body;
    const user = await User.findById(_id);
    const hashedPassword = user.password;
    const verifyPassword = await bcrypt.compare(password, hashedPassword);
    if (verifyPassword) {
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
        const data = await User.findByIdAndUpdate(
          _id,
          { password: newHashedPassword },
          { new: true }
        );
        return res.status(200).json({
          status: 200,
          message: "Password updated successfully",
        });
      }
    }
    return res.status(400).json({
      status: 400,
      message: "Incorrect Password",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
