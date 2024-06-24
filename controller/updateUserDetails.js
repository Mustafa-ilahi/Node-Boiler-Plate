const User = require("../models/user");

module.exports = async (req, res, next) => {
  const _id = req._id;
  const { username } = req.body;
  if (username) {
    const data = await User.findByIdAndUpdate(_id, { username }, { new: true });
    return res.status(200).json({
      status: 200,
      message: "Username updated successfully!",
      data,
    });
  } else {
    return res.status(400).json({ status: 400, message: "Username required" });
  }
};
