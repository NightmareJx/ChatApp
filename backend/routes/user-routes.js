const express = require("express");
const {
  registerUser,
  Auth_user,
  AllUsers,
} = require("../controllers/user-controller");
const requireAuth = require("../middleware/AuthMiddleware");
const router = express.Router();

router.post("/", registerUser);
router.post("/login", Auth_user);
router.get("/", requireAuth, AllUsers);

module.exports = router;
