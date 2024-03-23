const Notification = require("../models/NotificationModel");
const User = require("../models/UserModel");
const chatModel = require("../models/chatModel");
const mongoose = require("mongoose");

// add notification
const Add_Notif = async (req, res) => {
  const { senderID, chatID, content } = req.body;
  console.log(senderID, chatID, content);
  if (!senderID || !chatID || !content) {
    console.log("senderID , content and chatID is required in the req body");
  }
  try {
    const senderObjectId = new mongoose.Types.ObjectId(senderID);
    const chatObjectId = new mongoose.Types.ObjectId(chatID);

    const existingNotif = await Notification.find({
      sender: senderObjectId,
      chat: chatObjectId,
    });
    console.log(existingNotif);

    if (existingNotif.length > 0) {
      // Update existing notification
      const updatedNotif = await Notification.findByIdAndUpdate(
        existingNotif[0]._id,
        { $inc: { numNotif: 1 }, $set: { content: content } }, // Increment numNotif by 1
        { new: true } // Return updated document
      )
        .populate("sender", "name pic")
        .populate("chat");
      const populatedupdatedNotif = await User.populate(updatedNotif, {
        path: "chat.users",
        select: "name pic email",
      });

      console.log(populatedupdatedNotif);
      return res.status(200).json(populatedupdatedNotif);
    } else {
      var notif = await Notification.create({
        sender: senderObjectId,
        content: content,
        chat: chatObjectId,
      });
      notif = await notif.populate("sender", "name pic");
      notif = await notif.populate("chat");
      notif = await User.populate(notif, {
        path: "chat.users",
        select: "name pic email",
      });
    }
    console.log("created in the db");
    console.log(notif);
    return res.status(200).json(notif);
  } catch (error) {
    console.log(error.message);
    return res.status(400).json(error.message);
  }
};

// get all the notifications
const All_Notif = async (req, res) => {
  const userID = req.user._id;

  try {
    // cant filter here bc it needs to be populated to check the find condition wich we cant do
    const notifications = await Notification.find()
      .populate("sender", "name pic")
      .populate("chat");

    // filter notification to get notifications of the user
    const filteredNotifications = notifications.filter(
      (notification) =>
        notification.chat.users.some((user) => user._id.equals(userID)) &&
        !notification.sender._id.equals(userID)
    );
    return res.status(200).json(filteredNotifications);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//delete the notification
const Del_Notif = async (req, res) => {
  const { NotifID } = req.body;

  try {
    const remove = await Notification.findByIdAndDelete(NotifID)
      .populate("sender", "name pic")
      .populate("chat");

    if (!remove) {
      return res.status(400).json({ error: "cant find the Notification ID" });
    }

    return res.status(200).json(remove);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  Add_Notif,
  All_Notif,
  Del_Notif,
};
