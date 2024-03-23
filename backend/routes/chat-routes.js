const express = require("express");
const requireAuth = require("../middleware/AuthMiddleware");
const {
  accesChat,
  Get_Chat,
  Add_Group,
  Rename_Group,
  AddToGroup,
  Delete_Group,
} = require("../controllers/chat-controller");

const router = express.Router();

router.post("/", requireAuth, accesChat);
router.get("/", requireAuth, Get_Chat);
router.post("/group", requireAuth, Add_Group);
router.put("/rename", requireAuth, Rename_Group);
router.put("/groupdelete", requireAuth, Delete_Group);
router.put("/groupadd", requireAuth, AddToGroup);

module.exports = router;
