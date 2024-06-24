const User = require("../models/user");

module.exports = async(req, res, next) => {
  try {
    const _id = req._id
    const data = await User.findById(_id).select('-password')

    return res.status(200).json({status:200,message:"User details",data})

  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};
