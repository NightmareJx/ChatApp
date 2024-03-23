const mongoose = require("mongoose");
const Notification = require("../models/NotificationModel");

const create_Notif = async (newMessageRecieved) => {
  if (
    !newMessageRecieved.sender._id ||
    !newMessageRecieved.chat._id ||
    !newMessageRecieved.content
  ) {
    console.log(
      "senderID, content, and chatID are required in the request body"
    );
    return null;
  }

  try {
    const content = newMessageRecieved.content;
    const senderObjectId = new mongoose.Types.ObjectId(
      newMessageRecieved.sender._id
    );
    const chatObjectId = new mongoose.Types.ObjectId(
      newMessageRecieved.chat._id
    );

    const existingNotif = await Notification.find({
      sender: senderObjectId,
      chat: chatObjectId,
    });

    if (existingNotif.length > 0) {
      // Update existing notification
      await Notification.findByIdAndUpdate(existingNotif[0]._id, {
        $inc: { numNotif: 1 },
        $set: { content: content },
      });

      const updatedNotif = await Notification.findById(existingNotif[0]._id)
        .populate("sender", "name pic")
        .populate("chat")
        .populate({ path: "chat.users", select: "name pic email" });

      console.log("Updated notification:", updatedNotif);
      return updatedNotif;
    } else {
      const newNotif = await Notification.create({
        sender: senderObjectId,
        content: content,
        chat: chatObjectId,
      });
      const createdNotif = await Notification.findById(newNotif._id)
        .populate("sender", "name pic")
        .populate("chat")
        .populate({ path: "chat.users", select: "name pic email" });

      console.log("Created notification:", createdNotif);
      return createdNotif;
    }
  } catch (error) {
    console.error("Error creating notification:", error.message);
    return null;
  }
};

module.exports = { create_Notif };
