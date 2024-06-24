const nodemailer = require("nodemailer");
const verifyEmail = require("./handleVerifyEmail");
const fs = require("fs");

require("dotenv").config;
module.exports = async (toEmail, subject, htmlFilePath, otp) => {
  try {
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

    const nodemailerUser = process.env.NODEMAILER_USER;
    const nodemailerPass = process.env.NODEMAILER_PASS;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: nodemailerUser,
        pass: nodemailerPass,
      },
    });

    htmlContent = htmlContent.replace("{{otp}}", otp);

    const exists = await verifyEmail(toEmail);

    if (!exists) {
      const errorMessage =
        "Invalid email address. Please make sure your email is verified.";
      throw new Error(errorMessage);
    }

    const info = {
      from: nodemailerUser,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(info);

    if (!result.accepted || result.accepted.length === 0) {
      const errorMessage =
        "Failed to send email. Please check the recipient email address.";
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// go your google account setting .then 2 step verification .then
// at last have an option app password .then {select app = mail} .then {select device = windown computer}
// .then create app pass and paste password
