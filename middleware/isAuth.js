require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({ status: 401, message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    const jwtSecret = process.env.JWT_SECRET;
    decodedToken = jwt.verify(token, jwtSecret);
  } catch (error) {
    console.log(error);
  }
  if (!decodedToken) {
    return res.status(401).json({ status: 401, message: "Unauthorized" });
  }

  req._id = decodedToken._id
  next()
};
