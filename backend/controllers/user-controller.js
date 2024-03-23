require("dotenv").config();
const User = require("../models/UserModel");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// token generator function
const Create_Token = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "2d" });
};

// sign up logic
const registerUser = async (req, res) => {
  const { name, email: userEmail, password, pic } = req.body;

  if (!name || !userEmail || !password) {
    return res.status(400).json({ error: "Please Enter All The Fields" });
  }

  if (!validator.isAlphanumeric(name)) {
    return res.status(400).json({ error: "Username Must be Alphanumeric" });
  }

  if (!validator.isEmail(userEmail)) {
    return res.status(400).json({ error: "Invalid Email" });
  }

  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({ error: "Password Not Strong Enough" });
  }

  // find if the email already exists
  const userExists = await User.findOne({ email: userEmail });
  if (userExists) {
    return res.status(400).json({ error: "User Already Exists" });
  }

  // find if the username already exists
  const usernameExists = await User.findOne({ name });
  if (usernameExists) {
    return res.status(400).json({ error: "Username Already Exists" });
  }

  // crypting the password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      name,
      email: userEmail,
      password: hash,
      pic,
    });
    // retrieving the user details
    const userName = user.name;
    const userEmailResponse = user.email;
    const userPic = user.pic;
    const userId = user._id;
    // generating a token
    const token = Create_Token(userId);
    return res.status(200).json({
      token,
      _id: userId,
      name: userName,
      email: userEmailResponse,
      pic:
        userPic ||
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

//login logic
const Auth_user = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Please Enter All The Fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "This Email Does Not Exist" });
    }

    const match = await bcrypt.compare(password, user.password);
    const _id = user._id;
    const name = user.name;
    const pic =
      user.pic ||
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

    if (!match) {
      return res.status(400).json({ error: "Invalid Password " });
    } else {
      const token = Create_Token(user._id);
      console.log(pic);
      return res.status(200).json({ _id, name, email, pic, token });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// search engine /api/user?search=khalid
const AllUsers = async (req, res) => {
  try {
    const searchQuery = req.query.search;

    if (!searchQuery || searchQuery.trim() === "") {
      return res.status(400).send({ error: "Please provide a search query" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: new RegExp(`^${searchQuery}`, "i") } }, // Match at the start of the name
        { email: { $regex: new RegExp(`^${searchQuery}`, "i") } }, // Match at the start of the email
      ],
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ error: "Failed to fetch users" });
  }
};

module.exports = { AllUsers };

module.exports = {
  registerUser,
  Auth_user,
  AllUsers,
};
