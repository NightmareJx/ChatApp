const express = require("express");
const protected = require("../middleware/AuthMiddleware");
const {
  Add_Notif,
  All_Notif,
  Del_Notif,
} = require("../controllers/notification-controller");

const router = express.Router();

router.get("/", protected, All_Notif);
router.post("/", protected, Add_Notif);
router.delete("/delete-notification", protected, Del_Notif);

module.exports = router;
