const jwt = require('jsonwebtoken');

const sendToken = async (user, res, StatusCode) => {
  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    const options = {
      path: "/",
      httpOnly: false,
    };
    res.cookie('token', token, options);

    res.status(StatusCode).json({
      success: true,
      data: user,
      token: token, 
    });
  } catch (error) {
    console.log("Error in generating token:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = sendToken;