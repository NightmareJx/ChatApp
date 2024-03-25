const express = require("express");
const {
  registerUser,
  Auth_user,
  AllUsers,
} = require("../controllers/userControllers");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, AllUsers);
router.post("/", registerUser);
router.post("/login", Auth_user);

module.exports = router;
