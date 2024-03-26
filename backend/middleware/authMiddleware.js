const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv = require("dotenv");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  dotenv.config();

  if (!authorization) {
    return res.status(400).json({ error: "Authorization token is required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    console.log(token);
    req.user = await User.findOne({ _id }).select("_id");
    // log and debug here maybe you have some error

    next();
  } catch {
    return res.status(400).json({ error: "request is not Authorised" });
  }
};

module.exports = requireAuth;
