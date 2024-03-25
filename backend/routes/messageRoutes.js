const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(requireAuth, allMessages);
router.post("/", requireAuth, sendMessage);

module.exports = router;
