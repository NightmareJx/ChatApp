const express = require("express");
const protected = require("../middleware/AuthMiddleware");
const {
  sendMessage,
  allMessages,
} = require("../controllers/message-controller");

const router = express.Router();

router.post("/", protected, sendMessage);
router.get("/:chatID", protected, allMessages);

module.exports = router;
