const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationModel = new Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.ObjectId,
      ref: "Chat",
    },
    numNotif: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationModel);
